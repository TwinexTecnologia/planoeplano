import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * AuditService — TUDO que altera dados sensíveis deve passar por aqui.
 * Chamado nos services de cada módulo (não trigger de banco, mas sim no app-level
 * para termos contexto de request: user_id, ip, company_id).
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(args: {
    company_id: string;
    user_id?: string;
    entidade: string;
    entidade_id?: string;
    acao:
      | 'CREATE'
      | 'UPDATE'
      | 'DELETE'
      | 'MAPEOU_ALIAS'
      | 'DESFEZ_MAPEO'
      | 'REABRIU_COMPETENCIA'
      | 'FECHOU_COMPETENCIA'
      | 'ALTEROU_PESO'
      | 'RECALCULOU_ICPP'
      | 'IMPORTOU_ARQUIVO';
    valor_anterior?: unknown;
    valor_novo?: unknown;
    ip?: string;
    observacao?: string;
  }) {
    return this.prisma.audit_logs.create({
      data: {
        company_id: args.company_id,
        user_id: args.user_id || null,
        entidade: args.entidade,
        entidade_id: args.entidade_id || null,
        acao: args.acao,
        valor_anterior_json: args.valor_anterior ? (args.valor_anterior as any) : null,
        valor_novo_json: args.valor_novo ? (args.valor_novo as any) : null,
        ip_usuario: args.ip || null,
        observacao: args.observacao || null,
      },
    });
  }
}
