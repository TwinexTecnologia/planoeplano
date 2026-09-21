import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('PostgreSQL conectado via Prisma');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Helper: retorna um PrismaClient EXTENDIDO que garante `company_id = X` em TODAS
   * as operações — tanto LEITURAS quanto ESCRITAS.
   *
   * REGRAS DE ISOLAMENTO (SaaS multiempresa — nível app):
   *
   *  • LEITURAS (findMany, findUnique, findFirst, count, aggregate, groupBy):
   *    acrescenta WHERE company_id = X AUTOMATICAMENTE, mesmo que a query já
   *    tenha outras condições.
   *
   *  • ESCRITAS (update, updateMany, upsert, delete, deleteMany):
   *    acrescenta WHERE company_id = X ANTES de rodar. Se a operação for por
   *    ID único e o ID não pertencer a essa empresa, retorna 0 linhas afetadas
   *    (update/delete) ou lança erro de FK (upsert). A aplicação então trata
   *    como "registro não encontrado" e lança NotFoundException.
   *
   *  • CREATE (create, createMany):
   *    INJETA AUTOMATICAMENTE `company_id = X` nos dados de criação. Isso
   *    evita esquecimento humano nos services.
   *
   *  • EXCEÇÃO: operações $queryRaw / $executeRaw NÃO passam por aqui
   *    (limitação de Prisma). Em Raw queries, sempre incluir company_id
   *    MANUALMENTE no WHERE / INSERT. (Registrado nas regras de contribuição.)
   *
   * Usar SEMPRE que houver usuário autenticado. Nunca usar `this.prisma.*`
   * diretamente em dados tenantizados.
   */
  scoped(companyId: string) {
    if (!companyId || typeof companyId !== 'string') {
      throw new Error('PrismaService.scoped: companyId inválido.');
    }
    return this.$extends({
      query: {
        $allModels: {
          // ---------- LEITURAS ----------
          async findMany({ args, query }) {
            args.where = { ...(args.where || {}), company_id: companyId } as any;
            return query(args);
          },
          async findUnique({ args, query }) {
            if (args.where) {
              (args.where as any).company_id = companyId;
            }
            return query(args);
          },
          async findFirst({ args, query }) {
            args.where = { ...(args.where || {}), company_id: companyId } as any;
            return query(args);
          },
          async findFirstOrThrow({ args, query }) {
            args.where = { ...(args.where || {}), company_id: companyId } as any;
            return query(args);
          },
          async findUniqueOrThrow({ args, query }) {
            if (args.where) {
              (args.where as any).company_id = companyId;
            }
            return query(args);
          },
          async count({ args, query }) {
            args.where = { ...(args.where || {}), company_id: companyId } as any;
            return query(args);
          },
          async aggregate({ args, query }) {
            args.where = { ...(args.where || {}), company_id: companyId } as any;
            return query(args);
          },
          async groupBy({ args, query }) {
            args.where = { ...(args.where || {}), company_id: companyId } as any;
            return query(args);
          },

          // ---------- ESCRITAS: WHERE + company_id ----------
          async update({ args, query }) {
            args.where = { ...(args.where || {}), company_id: companyId } as any;
            return query(args);
          },
          async updateMany({ args, query }) {
            args.where = { ...(args.where || {}), company_id: companyId } as any;
            return query(args);
          },
          async upsert({ args, query }) {
            args.where = { ...(args.where || {}), company_id: companyId } as any;
            // caso cair no create, injeta também
            if (args.create && typeof args.create === 'object') {
              (args.create as any).company_id = companyId;
            }
            return query(args);
          },
          async delete({ args, query }) {
            args.where = { ...(args.where || {}), company_id: companyId } as any;
            return query(args);
          },
          async deleteMany({ args, query }) {
            if (args?.where) {
              args.where = { ...(args.where || {}), company_id: companyId } as any;
            } else if (args) {
              args.where = { company_id: companyId } as any;
            }
            return query(args);
          },

          // ---------- CREATE: injeta company_id ----------
          async create({ args, query }) {
            if (args.data && typeof args.data === 'object') {
              (args.data as any).company_id = companyId;
            }
            return query(args);
          },
          async createMany({ args, query }) {
            if (args?.data && Array.isArray(args.data)) {
              args.data = args.data.map(row =>
                row && typeof row === 'object'
                  ? { ...(row as any), company_id: companyId }
                  : row,
              );
            } else if (args?.data && typeof args.data === 'object') {
              (args.data as any).company_id = companyId;
            }
            return query(args);
          },
        },
      },
    });
  }
}
