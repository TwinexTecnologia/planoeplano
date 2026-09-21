/**
 * @costbase/shared
 *
 * Tipos TypeScript, enums e esquemas Zod compartilhados entre backend (NestJS)
 * e frontend (Next.js). Esta camada evita duplicação e garante consistência
 * entre API e UI.
 *
 * Regra: sem dependências de ORM (Prisma) ou de frameworks (React, Nest).
 */

// ---------- Multiempresa / Tenancy ----------
export interface CompanyContext {
  companyId: string;
  userId: string;
  userRole: 'OWNER' | 'ADMIN' | 'ANALISTA' | 'REVISOR' | 'VISUALIZADOR';
}

// ---------- 3 Camadas ----------
export type DataLayer = 'raw' | 'canonical' | 'calculated';

// ---------- Matching ----------
export type MatchStatus =
  | 'auto_matched'
  | 'review_needed'
  | 'new'
  | 'ignored';

export type MatchDecisionAction =
  | 'CONFIRMAR_MATCH'
  | 'ESCOLHER_OUTRO'
  | 'CRIAR_NOVO'
  | 'ADIAR'
  | 'IGNORAR';

// ---------- Competências ----------
export type CompetenciaStatus =
  | 'DRAFT'       // Rascunho
  | 'PROCESSING'  // Em processamento (importação / matching)
  | 'REVIEW'      // Em revisão humana
  | 'VALIDATED'   // Validado — pronto p/ fechar
  | 'CLOSED';     // Fechado — histórico congelado

// ---------- Regras ICPP (PLACEHOLDERS — PV1–PV10 PENDENTES) ----------
/**
 * Importante: NENHUMA regra abaixo está "fechada".
 * Os valores padrão são meramente especificações do formato JSONB aceito
 * por icpp_methodologies. A implementação real depende da validação do
 * dono do processo.
 */

export type FontePeso = 'orcamento_base' | 'preco_total_global' | 'preco_unitario_x_qtd' | 'manual';
export type TratamentoSemPreco = 'mantem_anterior' | 'excluir_item' | 'interpolar';
export type TratamentoItemMovimentacao = 'delta_zero_no_mes' | 'excluir_e_redistribuir_peso' | 'manter_peso';

export interface RegraPesos {
  fonte: FontePeso;
  periodo_base_competencia?: string;    // YYYYMM (PV1)
  recalcular_ano_a_ano?: boolean;        // (PV10)
  itens_coluna_nao_utilizar_sao_excluidos?: boolean; // (PV7)
}

export interface RegraVariacaoItem {
  preco_referencia: 'preco_unitario' | 'preco_total_global';  // (PV5)
  tratar_sem_preco: TratamentoSemPreco;                        // (PV3)
  coluna_delta_acum_item: string;                               // (PV8)
  coluna_delta_acum_custo_total: string;                        // (PV8)
}

export interface RegraItensMovimento {
  entrada: TratamentoItemMovimentacao;   // (PV4)
  saida: TratamentoItemMovimentacao;     // (PV4)
  substituicao?: 'novo_item_independente' | 'liga_indice_item_anterior';
}

export interface RegraNumeroIndice {
  competencia_base: string;              // YYYYMM (PV6)
  valor_base: number;                    // tipicamente 100
}

export interface RegraAcumulado {
  metodo: 'multiplicativo_12_periodos' | 'soma_12_meses' | 'numero_indice_i_/_i-12';
  janela_meses_12: 12;
  janela_meses_24: 24;
}

export interface RegraOutliers {
  limite_superior_pct: number;   // ex: 0.5 = +50% vs. média 6m
  limite_inferior_pct: number;
  acao: 'marcar_para_revisao' | 'remover_calculo_e_registrar';
}

// ---------- PV1–PV10 checklist do dono do processo ----------
export interface PendentesValidacao {
  PV1_mes_base_pesos: boolean;
  PV2_fonte_peso_preco_total_vs_qtd_x_pu: boolean;
  PV3_item_sem_preco_no_mes: boolean;
  PV4_itens_entrada_e_saida_cesta: boolean;
  PV5_preco_referencia_unitario_vs_total: boolean;
  PV6_mes_base_numero_indice_100: boolean;
  PV7_coluna_nao_utilizar: boolean;
  PV8_colunas_F_vs_G_variacao_acum: boolean;
  PV9_macrocategorias_mo_alv_estrutural: boolean;
  PV10_revisao_pesos_anual: boolean;
}

export const TODAS_PV: (keyof PendentesValidacao)[] = [
  'PV1_mes_base_pesos',
  'PV2_fonte_peso_preco_total_vs_qtd_x_pu',
  'PV3_item_sem_preco_no_mes',
  'PV4_itens_entrada_e_saida_cesta',
  'PV5_preco_referencia_unitario_vs_total',
  'PV6_mes_base_numero_indice_100',
  'PV7_coluna_nao_utilizar',
  'PV8_colunas_F_vs_G_variacao_acum',
  'PV9_macrocategorias_mo_alv_estrutural',
  'PV10_revisao_pesos_anual',
];
