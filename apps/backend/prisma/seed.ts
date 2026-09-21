/**
 * ============================================================
 *  SEED INICIAL — CostBase
 * ============================================================
 *
 *  Cria dados placeholder para desenvolvimento local:
 *
 *    1. Empresa: Plano&Plano (SaaS trial)
 *    2. Usuário: Alex Simonis — OWNER (senha: demo1234)
 *       login demo: alex@planoaplano.com.br / demo1234
 *    3. 14 Categorias + 24 Famílias (baseadas no Excel real)
 *    4. 3 Índices externos (INCC, ICC-SP, IPCA)
 *    5. 12 Competências (AGO/25 → SET/26, status placeholder)
 *    6. Metodologia ICPP V1 (PLACEHOLDER — SEM FÓRMULAS FIXAS)
 *       regras_* = null até validação PV1–PV10 com dono do processo.
 *    7. 2 itens canônicos exemplo + aliases (para testar matching)
 *
 *  Uso:
 *    $ npm --workspace apps/backend run seed
 * ============================================================
 */

import { PrismaClient, PlanoEmpresa, RoleUsuario, StatusCompetencia } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 CostBase Seed — Iniciando...');

  // ---- 1. Empresa Plano&Plano ----
  const planoPlano = await prisma.companies.upsert({
    where: { id: 'comp_plano_plano_001' },
    update: {},
    create: {
      id: 'comp_plano_plano_001',
      nome: 'Plano & Plano Construções',
      cnpj: '00.000.000/0001-00',
      plano: PlanoEmpresa.PRO,
      ativo: true,
      dados_empresa_json: {
        endereco: 'São Paulo / SP',
        segmento: 'Construção Civil · Empreendimentos residenciais e comerciais',
      },
    },
  });
  console.log(`  ✅ Empresa: ${planoPlano.nome} (${planoPlano.id})`);

  // ---- 2. Usuário Alex ----
  const SENHA_DEMO = 'demo1234';
  const senhaHash = await bcrypt.hash(SENHA_DEMO, 10);
  const alex = await prisma.users.upsert({
    where: { company_id_email: { company_id: planoPlano.id, email: 'alex@planoaplano.com.br' } },
    update: {},
    create: {
      company_id: planoPlano.id,
      email: 'alex@planoaplano.com.br',
      nome: 'Alex Simonis',
      senha_hash: senhaHash,
      role: RoleUsuario.OWNER,
      ativo: true,
    },
  });
  console.log(`  ✅ Usuário: ${alex.nome} · ${alex.email} · senha demo = "${SENHA_DEMO}"`);

  // ---- 3. Categorias + Famílias (base Excel) ----
  const CATS_FAMS: Array<{ cat: string; ordem: number; fams: string[] }> = [
    { cat: 'MAT Bloco de Concreto',       ordem: 1,  fams: ['Bloco cerâmico', 'Bloco de concreto'] },
    { cat: 'MAT Concreto',                 ordem: 2,  fams: ['Concreto usinado', 'Massa de concreto'] },
    { cat: 'MAT Graute Usinado',           ordem: 3,  fams: ['Graute usinado'] },
    { cat: 'MAT Graute Silo',              ordem: 4,  fams: ['Graute de silo'] },
    { cat: 'MAT Argamassa',                ordem: 5,  fams: ['Argamassa colante', 'Argamassa de assentamento'] },
    { cat: 'MAT Estaca Pré-Moldada',       ordem: 6,  fams: ['Estaca pré-moldada'] },
    { cat: 'MAT Aço',                       ordem: 7,  fams: ['Aço CA-50', 'Aço CA-60'] },
    { cat: 'MAT Tela Aço',                  ordem: 8,  fams: ['Tela soldada'] },
    { cat: 'EMP Instalações',               ordem: 9,  fams: ['Instalações hidráulicas', 'Instalações elétricas', 'Instalações SÓ MO'] },
    { cat: 'MAT Barramento',                ordem: 10, fams: ['Barramento elétrico'] },
    { cat: 'MAT Cabos Entrada',             ordem: 11, fams: ['Cabos de entrada de energia', 'Tubos e conexões', 'Condutores elétricos'] },
    { cat: 'MAT Cerâmica',                  ordem: 12, fams: ['Cerâmica para piso', 'Cerâmica parede'] },
    { cat: 'MO ALVENARIA',                  ordem: 13, fams: ['Pedreiro', 'Servente', 'Mestre de obras'] },
    { cat: 'MO ESTRUTURAL',                 ordem: 14, fams: ['MO Estrutural — concreto', 'MO Estrutural — aço'] },
    { cat: 'Elevadores',                    ordem: 15, fams: ['Elevador passageiros', 'Elevador de serviço'] },
    { cat: 'MAT Esquadrias de Alumínio',    ordem: 16, fams: ['Janela de correr', 'Porta de alumínio', 'Caixilho', 'Vidro temperado'] },
  ];

  let categoriasCriadas = 0, familiasCriadas = 0;
  for (const bloco of CATS_FAMS) {
    const cat = await prisma.categories.upsert({
      where: { company_id_nome: { company_id: planoPlano.id, nome: bloco.cat } },
      update: {},
      create: { company_id: planoPlano.id, nome: bloco.cat, ordem: bloco.ordem, ativo: true },
    });
    categoriasCriadas++;
    for (const famNome of bloco.fams) {
      await prisma.families.upsert({
        where: {
          company_id_category_id_nome: {
            company_id: planoPlano.id, category_id: cat.id, nome: famNome,
          },
        },
        update: {},
        create: {
          company_id: planoPlano.id, category_id: cat.id, nome: famNome,
          ativo: true, ordem: 1,
        },
      });
      familiasCriadas++;
    }
  }
  console.log(`  ✅ ${categoriasCriadas} categorias · ${familiasCriadas} famílias`);

  // ---- 4. Índices externos ----
  const indexes = [
    { sigla: 'INCC',   nome: 'Índice Nacional da Construção Civil',          instituicao: 'FGV' },
    { sigla: 'ICC-SP', nome: 'Índice da Construção Civil de São Paulo',       instituicao: 'FGV · Padrão Econômico' },
    { sigla: 'IPCA',   nome: 'Índice Nacional de Preços ao Consumidor Amplo', instituicao: 'IBGE' },
  ];
  for (const ix of indexes) {
    await prisma.external_indexes.upsert({
      where: { company_id_sigla: { company_id: planoPlano.id, sigla: ix.sigla } },
      update: {},
      create: { company_id: planoPlano.id, sigla: ix.sigla, nome: ix.nome, instituicao: ix.instituicao, ativo: true },
    });
  }
  console.log(`  ✅ ${indexes.length} índices externos (INCC · ICC-SP · IPCA)`);

  // ---- 5. Competências AGO/25 → OUT/26 ----
  // SET/26 = FECHADO e OUT/26 = EM REVISÃO, com os KPIs do usuário.
  // Contadores são populados EXPLICITAMENTE em SET/26 e OUT/26 para refletir a UI.
  const PERIODOS_COMPLETOS: Array<{
    comp: string; ini: string; fim: string; status: StatusCompetencia;
    kpis?: { total: number; rec: number; rev: number; nov: number };
    icppCalc?: boolean; icppHom?: boolean;
    pendencia?: string | null;
    fechado?: boolean;
    descricao?: string;
  }> = [
    { comp: '202508', ini: '2025-08-01', fim: '2025-08-31', status: StatusCompetencia.CLOSED, fechado: true },
    { comp: '202509', ini: '2025-09-01', fim: '2025-09-30', status: StatusCompetencia.CLOSED, fechado: true },
    { comp: '202510', ini: '2025-10-01', fim: '2025-10-31', status: StatusCompetencia.CLOSED, fechado: true },
    { comp: '202511', ini: '2025-11-01', fim: '2025-11-30', status: StatusCompetencia.CLOSED, fechado: true },
    { comp: '202512', ini: '2025-12-01', fim: '2025-12-31', status: StatusCompetencia.CLOSED, fechado: true },
    { comp: '202601', ini: '2026-01-01', fim: '2026-01-31', status: StatusCompetencia.CLOSED, fechado: true },
    { comp: '202602', ini: '2026-02-01', fim: '2026-02-28', status: StatusCompetencia.CLOSED, fechado: true },
    { comp: '202603', ini: '2026-03-01', fim: '2026-03-31', status: StatusCompetencia.CLOSED, fechado: true },
    { comp: '202604', ini: '2026-04-01', fim: '2026-04-30', status: StatusCompetencia.CLOSED, fechado: true },
    { comp: '202605', ini: '2026-05-01', fim: '2026-05-31', status: StatusCompetencia.CLOSED, fechado: true },
    { comp: '202606', ini: '2026-06-01', fim: '2026-06-30', status: StatusCompetencia.CLOSED, fechado: true },
    { comp: '202607', ini: '2026-07-01', fim: '2026-07-31', status: StatusCompetencia.CLOSED, fechado: true },
    { comp: '202608', ini: '2026-08-01', fim: '2026-08-31', status: StatusCompetencia.CLOSED, fechado: true },
    {
      comp: '202609', ini: '2026-09-01', fim: '2026-09-30', status: StatusCompetencia.CLOSED, fechado: true,
      descricao: 'SET/26 — Competência de referência (base gráfico AGO/25 → SET/26)',
      kpis: { total: 853, rec: 853, rev: 0, nov: 0 },
      icppCalc: true, icppHom: true, pendencia: null,
    },
    {
      comp: '202610', ini: '2026-10-01', fim: '2026-10-31', status: StatusCompetencia.REVIEW,
      descricao: 'OUT/26 — Em revisão humana de matching',
      kpis: { total: 867, rec: 812, rev: 55, nov: 42 },
      icppCalc: false, icppHom: false,
      pendencia: '55 itens pendentes de revisão humana de mapeamento + ICPP ainda não calculado',
    },
  ];

  const agora = new Date();
  let qtdPeriodos = 0;
  for (const p of PERIODOS_COMPLETOS) {
    const fechadoEm = p.fechado ? new Date(p.fim + 'T18:00:00-03:00') : null;
    const validadoEm = p.fechado ? new Date(p.fim + 'T17:00:00-03:00') : null;
    await prisma.periods.upsert({
      where: { company_id_competencia: { company_id: planoPlano.id, competencia: p.comp } },
      update: {
        status: p.status,
        descricao: p.descricao,
        total_itens_importados: p.kpis?.total ?? null,
        itens_reconhecidos: p.kpis?.rec ?? null,
        itens_pendentes_revisao: p.kpis?.rev ?? null,
        itens_novos: p.kpis?.nov ?? null,
        icpp_calculado: p.icppCalc ?? false,
        icpp_homologado: p.icppHom ?? false,
        pendencia_critica: p.pendencia ?? null,
        criado_por: alex.id,
        validado_em: p.status === StatusCompetencia.CLOSED || p.status === StatusCompetencia.VALIDATED ? validadoEm : null,
        validado_por: p.status === StatusCompetencia.CLOSED || p.status === StatusCompetencia.VALIDATED ? alex.id : null,
        fechado_em: fechadoEm,
        fechado_por: p.fechado ? alex.id : null,
      },
      create: {
        company_id: planoPlano.id,
        competencia: p.comp,
        data_inicio: new Date(p.ini),
        data_fim: new Date(p.fim),
        status: p.status,
        descricao: p.descricao,
        total_itens_importados: p.kpis?.total ?? null,
        itens_reconhecidos: p.kpis?.rec ?? null,
        itens_pendentes_revisao: p.kpis?.rev ?? null,
        itens_novos: p.kpis?.nov ?? null,
        icpp_calculado: p.icppCalc ?? false,
        icpp_homologado: p.icppHom ?? false,
        pendencia_critica: p.pendencia ?? null,
        criado_por: alex.id,
        validado_em: p.status === StatusCompetencia.CLOSED || p.status === StatusCompetencia.VALIDATED ? validadoEm : null,
        validado_por: p.status === StatusCompetencia.CLOSED || p.status === StatusCompetencia.VALIDATED ? alex.id : null,
        fechado_em: fechadoEm,
        fechado_por: p.fechado ? alex.id : null,
        created_at: p.status === StatusCompetencia.CLOSED ? new Date(p.ini + 'T09:00:00-03:00') : agora,
      },
    });
    qtdPeriodos++;
  }
  console.log(`  ✅ ${qtdPeriodos} competências (AGO/25 → OUT/26) · SET/26 CLOSED · OUT/26 REVIEW`);

  // ---- 6. Metodologia ICPP V1 (PLACEHOLDER — SEM FÓRMULAS!) ----
  // ⚠️  TODOS os campos regras_* ficam NULL intencionalmente.
  //     Nenhum valor será assumido antes da validação PV1–PV10 com dono do processo.
  const metodoV1 = await prisma.icpp_methodologies.upsert({
    where: { company_id_versao_nome: { company_id: planoPlano.id, versao_nome: 'V1' } },
    update: {},
    create: {
      company_id: planoPlano.id,
      versao_nome: 'V1',
      sigla_indice: 'ICPP-SP',
      descricao:
        'PLACEHOLDER — Metodologia original em uso até validação PV1–PV10. ' +
        'NÃO existem fórmulas codificadas nesta versão. Todos os parâmetros de cálculo ' +
        '(mês-base pesos, tratamento itens novos/sem preço, saída da cesta, outliers, etc.) ' +
        'serão preenchidos APENAS após validação documental com o dono do processo. ' +
        'Qualquer cálculo executado antes disso deve ser considerado rascunho.',
      is_active: true,
      // ------------ ↓↓↓  PENDENTE DE VALIDAÇÃO (PV1–PV10)  ↓↓↓ ------------
      regra_pesos_json: null,
      regra_variacao_item_json: null,
      regra_itens_novos_json: null,
      regra_itens_saida_json: null,
      regra_mes_base_num_indice_json: null,
      regra_calculo_acumulado_json: null,
      regra_outliers_json: null,
      regra_substituicao_json: null,
      created_by: alex.id,
    },
  });
  console.log(`  ✅ Metodologia V1 · ID=${metodoV1.id} · (regras = null · PV1–PV10 pendentes)`);

  // Associar Metodologia V1 a TODAS as competências (obrigatória para o fechamento)
  await prisma.periods.updateMany({
    where: { company_id: planoPlano.id },
    data: { metodo_id: metodoV1.id },
  });
  console.log(`  ✅ Metodologia V1 associada a todas as competências.`);

  // ---- 7. Itens canônicos exemplo + aliases ----
  const catEsq = await prisma.categories.findUnique({
    where: { company_id_nome: { company_id: planoPlano.id, nome: 'MAT Esquadrias de Alumínio' } },
    select: { id: true, families: { where: { nome: 'Janela de correr' }, take: 1 } },
  });
  const catConcreto = await prisma.categories.findUnique({
    where: { company_id_nome: { company_id: planoPlano.id, nome: 'MAT Concreto' } },
    select: { id: true, families: { where: { nome: 'Concreto usinado' }, take: 1 } },
  });

  const itensCanonicos = [
    {
      id: 'MAT-ESQ-0038',
      catId: catEsq!.id,
      famId: catEsq!.families[0]?.id,
      nome: 'Janela de correr alumínio 2 folhas 1,50 × 1,21',
      un: 'unid',
      carac: {
        tipo: 'Janela',
        material: 'Alumínio',
        modelo: 'J02',
        abertura: 'Correr',
        folhas: 2,
        largura_m: 1.5,
        altura_m: 1.21,
        veneziana: false,
      },
      aliases: [
        'J02 - JANELA DE CORRER SEM VP - 2FL - 1,50X1,21',
        'JANELA CORRER 2F ALUMÍNIO 1,50X1,21',
        'J02 ALUM 2F 150X121',
        'JANELA ALUMÍNIO CORRER 2F',
        'J02 JANELA CORRER 2F ALUM',
        'JANELA J02 ALUM CORRER 150X121 S/V',
      ],
    },
    {
      id: 'MAT-CON-0012',
      catId: catConcreto!.id,
      famId: catConcreto!.families[0]?.id,
      nome: 'Concreto usinado fck = 30 MPa',
      un: 'm³',
      carac: {
        tipo: 'Concreto',
        resistencia: 'fck=30',
        processo: 'Usinado',
        slump: 100,
      },
      aliases: [
        'CONCRETO USINADO FCK 30 SLUMP 10',
        'CONCRETO FCK 30 USINADO',
        'CONCRETO FCK30',
        'CON. FCK30 USINADO',
      ],
    },
  ];

  for (const it of itensCanonicos) {
    await prisma.canonical_items.upsert({
      where: { company_id_id: { company_id: planoPlano.id, id: it.id } },
      update: {},
      create: {
        id: it.id,
        company_id: planoPlano.id,
        category_id: it.catId,
        family_id: it.famId,
        nome_oficial: it.nome,
        unidade_padrao: it.un,
        caracteristicas_json: it.carac as any,
        created_by: alex.id,
      },
    });

    for (const alias of it.aliases) {
      const descNormalizada = alias
        .toUpperCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\p{L}\p{N}\s]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
      const hash = simpleHash(descNormalizada);

      await prisma.item_aliases.upsert({
        where: { company_id_alias_hash: { company_id: planoPlano.id, alias_hash: hash } },
        update: {},
        create: {
          company_id: planoPlano.id,
          canonical_item_id: it.id,
          descricao_original: alias,
          descricao_normalizada: descNormalizada,
          alias_hash: hash,
          mapeado_por: alex.id,
        },
      });
    }
  }
  console.log(`  ✅ ${itensCanonicos.length} itens canônicos exemplo + aliases`);

  // ---- 8. Log de auditoria ----
  await prisma.audit_logs.createMany({
    data: [
      {
        company_id: planoPlano.id, user_id: alex.id,
        entidade: 'icpp_methodologies', entidade_id: metodoV1.id,
        acao: 'CREATE',
        valor_novo_json: {
          versao_nome: 'V1',
          status_regras: 'PV1–PV10 PENDENTES',
          nota: 'Criado via seed inicial — NÃO contém fórmulas.',
        } as any,
        observacao: 'Seed inicial — Sprint 0',
      },
    ],
  });
  console.log('  ✅ Logs de auditoria inseridos');

  console.log('\n🌱 Seed finalizado com sucesso.');
  console.log('');
  console.log('   Login demo:     alex@planoaplano.com.br  /  demo1234');
  console.log('   Pré-requisito:  docker compose up -d  +  prisma migrate deploy');
}

/** Hash simples (64 hex chars) para alias_hash — não é SHA-256, apenas id de dedup. */
function simpleHash(s: string): string {
  let h1 = 0x811c9dc5, h2 = 0xdeadbeef;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = (Math.imul(h2 ^ c, 2246822519) >>> 0) ^ (h1 >>> 13);
  }
  return (h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')).padEnd(64, '0');
}

main()
  .catch(err => {
    console.error('❌ Seed falhou:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
