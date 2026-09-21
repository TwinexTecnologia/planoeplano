import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleUsuario, StatusCompetencia } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  ChangeStatusDto,
  CreatePeriodDto,
  ListPeriodsQueryDto,
  ReabrirCompetenciaDto,
  UpdatePeriodDto,
} from './dto';

/**
 * Fluxo oficial de status da competência:
 *
 *  DRAFT      → PROCESSING    (importando arquivo)
 *  PROCESSING → REVIEW        (matching automático rodou; esperando revisão humana)
 *  REVIEW     → VALIDATED     (pendências resolvidas + usuário confere)
 *  VALIDATED  → CLOSED        (ICPP calculado + homologado + fechamento)
 *
 *  Regressos permitidos: VALIDATED → REVIEW   (antes de fechar)
 *                        CLOSED    → REVIEW   (reabertura, COM justificativa e ROLE adequada)
 *
 *  CLOSED é bloqueado para updates comuns (só rota de REABRIR).
 *  Nenhum ICPP-SP é "inventado" aqui — a validação de fechamento só checa
 *  flags e contadores. O cálculo real fica na Sprint 9, após PV1–PV10.
 */
const TRANSICOES_PERMITIDAS: Partial<Record<StatusCompetencia, StatusCompetencia[]>> = {
  [StatusCompetencia.DRAFT]:      [StatusCompetencia.PROCESSING, StatusCompetencia.REVIEW],
  [StatusCompetencia.PROCESSING]: [StatusCompetencia.REVIEW, StatusCompetencia.DRAFT],
  [StatusCompetencia.REVIEW]:     [StatusCompetencia.VALIDATED, StatusCompetencia.PROCESSING, StatusCompetencia.CLOSED],
  [StatusCompetencia.VALIDATED]:  [StatusCompetencia.REVIEW, StatusCompetencia.CLOSED],
  // CLOSED só transiciona via método reabrir() — nunca diretamente.
};

@Injectable()
export class PeriodsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Todas as operações contra dados tenantizados DEVEM usar este client.
   * Nunca use this.prisma diretamente.
   *   - CREATE → tenant.periods.create (injeta company_id automaticamente)
   *   - LEITURAS → tenant.periods.findMany/findUnique (WHERE company_id)
   *   - ESCRITAS POR ID → tenant.periods.update/delete (WHERE company_id + id;
   *     se o ID pertencer a outra empresa, retorna 0 linhas → tratamos como 404)
   */
  private tenant(companyId: string) {
    return this.prisma.scoped(companyId);
  }

  /**
   * Valida se uma competência pode ser criada.
   * Impede duplicata por empresa + garante intervalo de datas.
   */
  async create(
    companyId: string,
    userId: string,
    dto: CreatePeriodDto,
    ip?: string,
  ) {
    const t = this.tenant(companyId);
    // 1. Duplicata por empresa (garantida no banco com @@unique; só faz mensagem amigável)
    const existe = await t.periods.findUnique({
      where: { company_id_competencia: { company_id: companyId, competencia: dto.competencia } },
    });
    if (existe) {
      throw new ConflictException(
        `Competência ${dto.competencia} já existe para esta empresa. Não é possível duplicar.`,
      );
    }
    if (new Date(dto.data_inicio) > new Date(dto.data_fim)) {
      throw new BadRequestException('data_inicio não pode ser posterior a data_fim.');
    }

    const criado = await t.periods.create({
      data: {
        competencia: dto.competencia,
        data_inicio: new Date(dto.data_inicio),
        data_fim: new Date(dto.data_fim),
        descricao: dto.descricao ?? null,
        metodo_id: dto.metodo_id ?? null,
        status: StatusCompetencia.DRAFT,
        criado_por: userId,
      },
    });

    await this.audit.log({
      company_id: companyId,
      user_id: userId,
      ip,
      entidade: 'period',
      entidade_id: criado.id,
      acao: 'CREATE',
      valor_novo: criado,
      observacao: `Criação da competência ${dto.competencia} (DRAFT)`,
    });
    return criado;
  }

  async findAll(companyId: string, query: ListPeriodsQueryDto = {}) {
    const t = this.tenant(companyId);
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.competencia) where.competencia = query.competencia;

    return t.periods.findMany({
      where,
      orderBy: [{ competencia: 'desc' }],
      include: {
        icpp_methodology: { select: { id: true, versao_nome: true, sigla_indice: true } },
        _count: {
          select: {
            imports: true,
            item_prices: true,
            icpp_results: true,
          },
        },
      },
    });
  }

  async findOne(companyId: string, id: string) {
    const t = this.tenant(companyId);
    const period = await t.periods.findUnique({
      where: { id },
      include: {
        icpp_methodology: true,
        imports: { orderBy: [{ created_at: 'desc' }], take: 10 },
        _count: {
          select: {
            imports: true,
            item_prices: true,
            icpp_results: true,
          },
        },
      },
    });
    if (!period) throw new NotFoundException('Competência não encontrada.');
    return period;
  }

  async findOneAuditLog(companyId: string, periodId: string, take = 50) {
    // Garantir que o registro pertence ao tenant antes de retornar dados:
    const t = this.tenant(companyId);
    const exists = await t.periods.findUnique({ where: { id: periodId }, select: { id: true } });
    if (!exists) throw new NotFoundException('Competência não encontrada.');
    // Audit_logs também é tenantizado.
    return this.tenant(companyId).audit_logs.findMany({
      where: { entidade: 'period', entidade_id: periodId },
      orderBy: [{ created_at: 'desc' }],
      take,
      include: { user: { select: { id: true, nome: true, email: true } } },
    });
  }

  /**
   * Atualiza dados básicos (datas, descrição, observação, método).
   * BLOQUEIA se status = CLOSED.
   */
  async update(
    companyId: string,
    userId: string,
    id: string,
    dto: UpdatePeriodDto,
    ip?: string,
  ) {
    const t = this.tenant(companyId);
    const atual = await t.periods.findUnique({ where: { id } });
    if (!atual) throw new NotFoundException('Competência não encontrada.');
    this.ensureNotClosed(atual.status);

    const update: any = {};
    if (dto.data_inicio) update.data_inicio = new Date(dto.data_inicio);
    if (dto.data_fim)   update.data_fim = new Date(dto.data_fim);
    if ('descricao' in dto)  update.descricao  = dto.descricao  ?? null;
    if ('observacao' in dto) update.observacao = dto.observacao ?? null;
    if ('metodo_id'  in dto) update.metodo_id  = dto.metodo_id  ?? null;

    if (update.data_inicio && update.data_fim && new Date(dto.data_inicio!) > new Date(dto.data_fim!)) {
      throw new BadRequestException('data_inicio não pode ser posterior a data_fim.');
    }
    if (Object.keys(update).length === 0) return atual;

    const atualizado = await t.periods.update({ where: { id }, data: update });
    await this.audit.log({
      company_id: companyId, user_id: userId, ip,
      entidade: 'period', entidade_id: id,
      acao: 'UPDATE',
      valor_anterior: atual,
      valor_novo: atualizado,
      observacao: 'Atualização de dados básicos da competência.',
    });
    return atualizado;
  }

  /**
   * Muda o status segundo o fluxo permitido TRANSICOES_PERMITIDAS.
   *  - Para VALIDATED: exige NENHUMA pendência crítica.
   *  - Para CLOSED:    exige VALIDATED antes, OU REVIEW + todos checks (inclui ICPP calculado+homologado).
   */
  async changeStatus(
    companyId: string,
    userId: string,
    role: RoleUsuario,
    id: string,
    dto: ChangeStatusDto,
    ip?: string,
  ) {
    const t = this.tenant(companyId);
    const atual = await t.periods.findUnique({ where: { id } });
    if (!atual) throw new NotFoundException('Competência não encontrada.');
    this.ensureNotClosed(atual.status); // CLOSED só pode ser alterado via reabrir()

    const destino = dto.status;
    const permitido = TRANSICOES_PERMITIDAS[atual.status] ?? [];
    if (!permitido.includes(destino)) {
      throw new BadRequestException(
        `Transição de status inválida: ${atual.status} → ${destino}. ` +
        `Permitidos: ${permitido.join(', ') || '(nenhum)'}`,
      );
    }

    // Validações por transição
    if (destino === StatusCompetencia.VALIDATED) {
      this.validarSemPendenciasCriticas(atual);
    }

    if (destino === StatusCompetencia.CLOSED) {
      // Só OWNER ou ADMIN podem fechar.
      if (role !== RoleUsuario.OWNER && role !== RoleUsuario.ADMIN) {
        throw new ForbiddenException('Apenas OWNER ou ADMIN podem fechar uma competência.');
      }
      this.validarParaFechamento(atual);
    }

    const updates: any = { status: destino };

    if (destino === StatusCompetencia.VALIDATED) {
      updates.validado_em = new Date();
      updates.validado_por = userId;
      if (!atual.pendencia_critica) updates.pendencia_critica = null;
    }
    if (destino === StatusCompetencia.CLOSED) {
      updates.fechado_em = new Date();
      updates.fechado_por = userId;
    }
    // Se voltar de VALIDATED → REVIEW, zerar timestamps de validação/fechamento
    if (atual.status === StatusCompetencia.VALIDATED && destino === StatusCompetencia.REVIEW) {
      updates.validado_em = null;
      updates.validado_por = null;
    }

    const novo = await t.periods.update({ where: { id }, data: updates });
    await this.audit.log({
      company_id: companyId, user_id: userId, ip,
      entidade: 'period', entidade_id: id,
      acao: 'UPDATE',
      valor_anterior: atual,
      valor_novo: novo,
      observacao: `Mudança de status: ${atual.status} → ${destino}.`,
    });
    if (destino === StatusCompetencia.CLOSED) {
      await this.audit.log({
        company_id: companyId, user_id: userId, ip,
        entidade: 'period', entidade_id: id,
        acao: 'FECHOU_COMPETENCIA',
        valor_novo: novo,
        observacao: 'Competência fechada. Dados congelados.',
      });
    }
    return novo;
  }

  /**
   * Reabre uma competência CLOSED → REVIEW.
   *  - Exige justificativa (10+ caracteres, salvo em campo e auditoria).
   *  - Exige role OWNER/ADMIN.
   *  - Limpa fechado_em/por.
   */
  async reabrir(
    companyId: string,
    userId: string,
    role: RoleUsuario,
    id: string,
    dto: ReabrirCompetenciaDto,
    ip?: string,
  ) {
    if (role !== RoleUsuario.OWNER && role !== RoleUsuario.ADMIN) {
      throw new ForbiddenException(
        'Apenas OWNER ou ADMIN podem reabrir uma competência fechada.',
      );
    }
    if ((dto.justificativa || '').trim().length < 10) {
      throw new BadRequestException('Justificativa de reabertura deve ter no mínimo 10 caracteres.');
    }
    const t = this.tenant(companyId);
    const atual = await t.periods.findUnique({ where: { id } });
    if (!atual) throw new NotFoundException('Competência não encontrada.');
    if (atual.status !== StatusCompetencia.CLOSED) {
      throw new BadRequestException(
        `Só é possível reabrir competências FECHADAS. Status atual: ${atual.status}.`,
      );
    }

    const novo = await t.periods.update({
      where: { id },
      data: {
        status: StatusCompetencia.REVIEW,
        fechado_em: null,
        fechado_por: null,
        validado_em: null,
        validado_por: null,
        ultima_reabertura_em: new Date(),
        ultima_reabertura_por: userId,
        ultima_reabertura_justificativa: dto.justificativa.trim(),
      },
    });
    await this.audit.log({
      company_id: companyId, user_id: userId, ip,
      entidade: 'period', entidade_id: id,
      acao: 'REABRIU_COMPETENCIA',
      valor_anterior: atual,
      valor_novo: novo,
      observacao: `Reabertura — justificativa: ${dto.justificativa.trim()}`,
    });
    return novo;
  }

  /** Soft-delete só permitido em DRAFT. Retorna undefined em sucesso. */
  async remove(companyId: string, userId: string, id: string, ip?: string) {
    const t = this.tenant(companyId);
    const atual = await t.periods.findUnique({ where: { id } });
    if (!atual) throw new NotFoundException('Competência não encontrada.');
    if (atual.status !== StatusCompetencia.DRAFT) {
      throw new BadRequestException(
        `Só é possível excluir competências em DRAFT. Status atual: ${atual.status}. ` +
        'Para competências já avançadas, reabra para DRAFT primeiro ou arquive (futuro).',
      );
    }
    await t.periods.delete({ where: { id } });
    await this.audit.log({
      company_id: companyId, user_id: userId, ip,
      entidade: 'period', entidade_id: id,
      acao: 'DELETE',
      valor_anterior: atual,
      observacao: `Exclusão da competência DRAFT ${atual.competencia}.`,
    });
  }

  // ---------- helpers internos ----------

  private ensureNotClosed(status: StatusCompetencia) {
    if (status === StatusCompetencia.CLOSED) {
      throw new BadRequestException(
        'Competência está FECHADA e não pode ser alterada. Utilize a rota de reabertura.',
      );
    }
  }

  /** Verifica pendências críticas genéricas (para VALIDATED). */
  private validarSemPendenciasCriticas(
    atual: any,
    _fields: string[],
  ) {
    const erros: string[] = [];
    if ((atual.itens_pendentes_revisao ?? 0) > 0) {
      erros.push(
        `${atual.itens_pendentes_revisao} itens ainda pendentes de revisão humana de mapeamento.`,
      );
    }
    if (atual.pendencia_critica) {
      erros.push(`Pendência ativa: ${atual.pendencia_critica}`);
    }
    if (erros.length > 0) {
      throw new BadRequestException(
        'Impossível validar competência. Resolva as pendências abaixo:\n - ' +
          erros.join('\n - '),
      );
    }
  }

  /** Regras de fechamento. Hoje: 0 pendências + ICPP calculado e homologado.
   *  Como ainda não temos engine de cálculo, lançamos um aviso caso as flags estejam falsas,
   *  MAS o controller deixa o usuário "marcar" como calculado e homologado via update? Não.
   *  Aqui nós:
   *   · Se icpp_calculado/homologado = false → BLOQUEIA (mantemos rigor).
   *   · A Sprint 9 conectará a engine para setar essas flags.
   */
  private validarParaFechamento(atual: any) {
    this.validarSemPendenciasCriticas(atual, []);

    if (!atual.metodo_id) {
      throw new BadRequestException(
        'Fechamento exige uma Metodologia ICPP-SP associada à competência.',
      );
    }
    if (atual.icpp_calculado !== true) {
      throw new BadRequestException(
        'Fechamento exige que o ICPP-SP tenha sido calculado nesta competência. ' +
        'Execute a rotina de cálculo (Sprint 9) antes de fechar.',
      );
    }
    if (atual.icpp_homologado !== true) {
      throw new BadRequestException(
        'Fechamento exige homologação manual do ICPP-SP calculado. ' +
        'Na tela do ICPP desta competência, clique em "Homologar" para liberar o fechamento.',
      );
    }
  }
}
