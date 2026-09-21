import { Injectable, NestMiddleware, ForbiddenException, Logger, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

declare global {
  namespace Express {
    interface Request {
      companyId?: string;
      userId?: string;
      userRole?: string;
    }
  }
}

/**
 * CompanyContextMiddleware
 *
 * SEGURANÇA REFORÇADA — Dupla checagem de tenancy:
 *
 *  1. Extrai company_id do JWT (PassportStrategy validou assinatura).
 *  2. VAI AO BANCO e confere se o usuário existe, está ATIVO, e realmente
 *     pertence à empresa informada no token.
 *  3. Anexa req.companyId / req.userId / req.userRole confirmados.
 *
 *  Por que dupla checagem?
 *  · Evita JWT antigo emitido antes do usuário ser desativado ou trocado de tenant.
 *  · Evita tokens forjados caso o segredo seja comprometido.
 *  · Qualquer associação por ID (update/delete periods) precisa passar por aqui ANTES.
 *
 *  URLs públicas continuam liberadas sem tenancy.
 */
@Injectable()
export class CompanyContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CompanyContextMiddleware.name);
  private readonly PUBLIC_ROUTES = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/docs',
    '/api/docs/',
    '/api/docs/json',
    '/api/health',
  ];

  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    if (this.PUBLIC_ROUTES.some(r => req.path.startsWith(r))) {
      return next();
    }

    const user = (req as any).user;
    if (!user) {
      // JwtAuthGuard vai bloquear rotas não públicas a seguir; aqui só deixa passar.
      return next();
    }

    if (!user.sub || !user.company_id || !user.role) {
      this.logger.error(`JWT malformado: ${JSON.stringify({ sub: user.sub, company_id: user.company_id, role: user.role })}`);
      throw new UnauthorizedException('Token inválido. Realize login novamente.');
    }

    // -------------- SEGUNDA CHECAGEM (BANCO) — CONTRA TOKEN FORJADO / USUÁRIO DESATIVADO --------------
    const dbUser = await this.prisma.users.findUnique({
      where: { id: user.sub },
      select: {
        id: true,
        company_id: true,
        role: true,
        ativo: true,
      },
    });

    if (!dbUser || !dbUser.ativo) {
      throw new ForbiddenException(
        'Usuário não encontrado ou desativado. Contate o administrador da empresa.',
      );
    }
    if (dbUser.company_id !== user.company_id) {
      this.logger.warn(
        `Inconsistência tenancy! JWT company=${user.company_id} vs Banco company=${dbUser.company_id}. user=${user.sub}`,
      );
      throw new ForbiddenException(
        'Token inválido para esta empresa. Realize login novamente.',
      );
    }
    if (dbUser.role !== user.role) {
      // Role pode ter sido promovida/rebaixada depois da emissão do token: usa a do BANCO (sempre fonte da verdade).
      this.logger.debug(`Role do JWT (${user.role}) desatualizada vs banco (${dbUser.role}). Usando a do banco. user=${user.sub}`);
    }

    req.companyId = dbUser.company_id;
    req.userId    = dbUser.id;
    req.userRole  = dbUser.role;

    next();
  }
}
