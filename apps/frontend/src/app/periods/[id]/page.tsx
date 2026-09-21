'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Lock, CheckCircle2, AlertCircle, RotateCcw, FileDigit, FileCheck2,
  Eye, PlusCircle, TrendingUp, CalendarDays, User2, Clock, Database, GitCompare,
  FileSpreadsheet, BarChart3, ScrollText, Unlock, ChevronDown,
} from 'lucide-react';
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  fmtCompetencia, fmtDataBR, fmtDataHoraBR, fmtPct, fmtPP, statusCompetenciaMeta,
  type StatusCompetenciaLabel,
} from '@/lib/utils';

/* =========================================================
 * DADOS MOCK
 *
 * Futuramente: fetch('/api/periods/' + id)
 * Cada aba virá de rota própria:
 *   resumo      → GET /api/periods/:id
 *   importações → GET /api/periods/:id/imports
 *   mapeamentos → GET /api/periods/:id/mappings  (counts + lista)
 *   cesta       → GET /api/periods/:id/basket (pesos + contribuições categoria)
 *   ICPP        → GET /api/periods/:id/icpp  (var_mensal, índice, acum 12/24m, vs INCC ICC IPCA)
 *   auditoria   → GET /api/periods/:id/audit   (logs CREATE UPDATE FECHOU REABRIU)
 * ========================================================= */
type ImportacaoRow = { id: string; arquivo: string; usuario: string; data: string; linhas: number; hash: string };
type AuditRow = {
  id: string;
  data: string;
  usuario: string;
  acao: 'CREATE' | 'UPDATE' | 'REABRIU_COMPETENCIA' | 'FECHOU_COMPETENCIA';
  obs: string;
};

const IMPORTS_MOCK_SET26: ImportacaoRow[] = [
  { id: 'imp_1', arquivo: 'SET-2026-PADRAO-ECONOMICO-v2-final.xlsx', usuario: 'Alex Simonis', data: '2026-09-15T10:12:00-03:00', linhas: 874, hash: 'sha256:7a1f…e3c9' },
  { id: 'imp_2', arquivo: 'SET-2026-PADRAO-ECONOMICO-v1-rascunho.xlsx', usuario: 'Alex Simonis', data: '2026-09-10T14:32:00-03:00', linhas: 870, hash: 'sha256:22ab…91c0' },
];

const AUDIT_MOCK_SET26: AuditRow[] = [
  { id: 'a1', data: '2026-09-30T18:00:00-03:00', usuario: 'Alex Simonis', acao: 'FECHOU_COMPETENCIA', obs: 'Competência fechada. Dados congelados. ICPP-SP = 5,61% a.m. (acum 12m).' },
  { id: 'a2', data: '2026-09-30T17:00:00-03:00', usuario: 'Alex Simonis', acao: 'UPDATE',            obs: 'Validado: 0 pendências de mapeamento. ICPP calculado e homologado.' },
  { id: 'a3', data: '2026-09-28T09:20:00-03:00', usuario: 'Alex Simonis', acao: 'UPDATE',            obs: 'Status: REVIEW → VALIDATED. Revisão humana concluída: 0 itens pendentes.' },
  { id: 'a4', data: '2026-09-25T16:45:00-03:00', usuario: 'Alex Simonis', acao: 'UPDATE',            obs: 'Resolvidos 12 itens pendentes (6 mapeamento manual, 4 aliases adicionados, 2 ignorados).' },
  { id: 'a5', data: '2026-09-20T18:10:00-03:00', usuario: 'Alex Simonis', acao: 'REABRIU_COMPETENCIA', obs: 'Justificativa: Inclusão de 2 itens de vidro temperado que saíram da importação por erro.' },
  { id: 'a6', data: '2026-09-15T10:12:00-03:00', usuario: 'Alex Simonis', acao: 'UPDATE',            obs: 'Importado arquivo SET-2026-PADRAO-ECONOMICO-v2-final.xlsx (874 linhas). Status: DRAFT → PROCESSING.' },
  { id: 'a7', data: '2026-09-01T09:00:00-03:00', usuario: 'Alex Simonis', acao: 'CREATE',            obs: 'Criação da competência SET/26 (DRAFT). Metodologia V1 selecionada.' },
];

const CAT_ICPP = [
  { cat: 'EMP Instalações',               peso: 18.63, var: 6.00, contr: 1.12 },
  { cat: 'MO ALV + ESTRUTURAL',          peso: 10.72, var: 6.00, contr: 0.64 },
  { cat: 'MAT Bloco de Concreto',         peso: 7.65,  var: 8.14, contr: 0.62 },
  { cat: 'MO ALVENARIA',                  peso: 6.67,  var: 5.99, contr: 0.40 },
  { cat: 'Elevadores',                    peso: 4.37,  var: 9.78, contr: 0.43 },
  { cat: 'MAT Concreto',                  peso: 3.90,  var: 5.45, contr: 0.21 },
  { cat: 'MAT Aço CA-50',                 peso: 3.41,  var: 5.08, contr: 0.17 },
  { cat: 'MAT Argamassa',                 peso: 2.95,  var: 4.15, contr: 0.12 },
  { cat: 'MAT Esquadrias de Alumínio',    peso: 2.10,  var: 2.42, contr: 0.05 },
  { cat: 'Demais (57 categorias)',        peso: 39.60, var: 5.70, contr: 2.25 },
];

const COMPETENCIA_DETAIL: Record<string, {
  id: string; comp: string; status: StatusCompetenciaLabel;
  icppVar: number; icppAcum12m: number; icppAcum24m: number; icppIdxBase100: number;
  inccAcum12m: number; iccSpAcum12m: number; ipcaAcum12m: number;
  total: number; rec: number; rev: number; nov: number;
  criado: string; criadoPor: string; validado?: string; validadoPor?: string; fechado?: string; fechadoPor?: string;
  reaberto?: string; reabertoPor?: string; reabertoJust?: string;
  metodo: string;
  pendencia?: string | null;
  descricao?: string;
}> = {
  period_202609: {
    id: 'period_202609', comp: '202609', status: 'CLOSED',
    icppVar: 0.36, icppAcum12m: 5.61, icppAcum24m: 10.08, icppIdxBase100: 105.61,
    inccAcum12m: 6.59, iccSpAcum12m: 7.35, ipcaAcum12m: 4.22,
    total: 853, rec: 853, rev: 0, nov: 0,
    criado: '2026-09-01T09:00:00-03:00', criadoPor: 'Alex Simonis',
    validado: '2026-09-30T17:00:00-03:00', validadoPor: 'Alex Simonis',
    fechado:  '2026-09-30T18:00:00-03:00', fechadoPor:  'Alex Simonis',
    reaberto: '2026-09-20T18:10:00-03:00', reabertoPor: 'Alex Simonis',
    reabertoJust: 'Inclusão de 2 itens de vidro temperado que saíram da importação por erro.',
    metodo: 'ICPP-SP V1 (Placeholder — PV1–PV10 pendentes)',
    descricao: 'SET/26 — Competência de referência (base do gráfico AGO/25→SET/26)',
  },
  period_202610: {
    id: 'period_202610', comp: '202610', status: 'REVIEW',
    icppVar: 0, icppAcum12m: 0, icppAcum24m: 0, icppIdxBase100: 0,
    inccAcum12m: 0, iccSpAcum12m: 0, ipcaAcum12m: 0,
    total: 867, rec: 812, rev: 55, nov: 42,
    criado: '2026-10-01T09:15:00-03:00', criadoPor: 'Alex Simonis',
    metodo: 'ICPP-SP V1 (Placeholder — PV1–PV10 pendentes)',
    descricao: 'OUT/26 — Em revisão humana de matching',
    pendencia: '55 itens pendentes de revisão humana de mapeamento + ICPP ainda não calculado',
  },
};

export default function PeriodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = (params?.id as string) || 'period_202609';

  const periodData = COMPETENCIA_DETAIL[idParam] ?? COMPETENCIA_DETAIL['period_202609'];
  const meta = statusCompetenciaMeta(periodData.status);

  return (
    <div className="space-y-6 pb-16">
      {/* ================== Header ================== */}
      <header>
        <button
          onClick={() => router.push('/periods')}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-600 transition mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Todas as competências
        </button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {fmtCompetencia(periodData.comp)}
              </h1>
              <Badge className={meta.tone + ' border px-3 py-1 text-xs font-medium'} variant="outline">
                {periodData.status === 'CLOSED' && <Lock className="h-3 w-3 mr-1 inline" />}
                {meta.label}
              </Badge>
              <Badge variant="outline" className="border-slate-200 text-slate-600 text-xs font-medium px-3 py-1">
                {periodData.comp}
              </Badge>
            </div>
            {periodData.descricao && (
              <p className="mt-2 text-sm text-muted-foreground max-w-3xl">{periodData.descricao}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Período: {fmtDataBR(periodData.comp.slice(0,4)+'-'+periodData.comp.slice(4,6)+'-01')} – {fmtDataBR(periodData.comp.slice(0,4)+'-'+periodData.comp.slice(4,6)+'-28')}</span>
              <span className="inline-flex items-center gap-1.5"><Database className="h-3.5 w-3.5" /> {periodData.metodo}</span>
            </div>
          </div>

          {/* Ações do topo — alinhadas ao status */}
          <div className="flex gap-2 flex-wrap">
            <Link href={`/periods/${idParam}/icpp`} passHref>
              <Button variant="outline"><BarChart3 className="h-4 w-4 mr-2" /> Ver ICPP</Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-brand-500 hover:bg-brand-600">
                  Ações <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem onClick={() => router.push(`/periods/new?copy=${idParam}`)}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" /> Copiar competência
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert('Placeholder: exportação CSV/XLSX do mês. Sprint 13.')}>
                  <FileDigit className="h-4 w-4 mr-2" /> Exportar CSV/XLSX
                </DropdownMenuItem>
                {periodData.status !== 'CLOSED' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Validar competência
                      <span className="ml-auto text-xs text-slate-400">Sem pendências</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <Lock className="h-4 w-4 mr-2" /> Fechar competência
                      <span className="ml-auto text-xs text-slate-400">Homologar ICPP</span>
                    </DropdownMenuItem>
                  </>
                )}
                {periodData.status === 'CLOSED' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        const j = prompt('Justificativa obrigatória para reabrir competência fechada (mínimo 10 caracteres):');
                        if (j && j.trim().length >= 10) {
                          alert('Sprint 1 implementado no backend POST /api/periods/:id/reabrir. Frontend só faz placeholder. Justificativa recebida: ' + j);
                        } else if (j) {
                          alert('Justificativa muito curta.');
                        }
                      }}
                      className="text-amber-800 focus:text-amber-800"
                    >
                      <Unlock className="h-4 w-4 mr-2 text-amber-600" /> Reabrir competência
                      <span className="ml-auto text-[10px] font-semibold text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 border border-amber-200">OWNER/ADMIN</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ================== KPIs ================== */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Total de itens importados"
          value={periodData.total.toString()}
          hint="Linhas válidas do arquivo importado"
          Icon={FileDigit}
          tone="slate"
        />
        <KpiCard
          label="Reconhecidos"
          value={periodData.rec.toString()}
          hint={periodData.total > 0 ? `${((periodData.rec / periodData.total) * 100).toFixed(1)}% da base` : ''}
          Icon={FileCheck2}
          tone="emerald"
        />
        <KpiCard
          label="Para revisar"
          value={periodData.rev.toString()}
          hint={periodData.rev === 0 ? 'Nenhum item pendente' : 'Ação humana obrigatória'}
          Icon={Eye}
          tone={periodData.rev === 0 ? 'emerald' : 'rose'}
        />
        <KpiCard
          label="Criados neste mês"
          value={periodData.nov.toString()}
          hint="Itens canônicos nascidos nesta competência"
          Icon={PlusCircle}
          tone="sky"
        />
      </section>

      {/* ================== Banner: pendência crítica (se houver) ================== */}
      {periodData.pendencia && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900">Pendência crítica bloqueia validação/fechamento</h3>
              <p className="text-sm text-amber-800 mt-0.5">{periodData.pendencia}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="bg-white border-amber-200 text-amber-800 hover:bg-amber-50 whitespace-nowrap"
            onClick={() => router.push(`/periods/${idParam}#mapeamentos`)}
          >
            Resolver na aba Mapeamentos
          </Button>
        </div>
      )}

      {/* ================== TABS ================== */}
      <Tabs defaultValue="resumo" className="w-full">
        <div className="sticky top-0 z-20 -mx-4 px-4 pt-2 pb-3 bg-slate-50/80 backdrop-blur border-b border-slate-200 md:mx-0 md:px-0 md:bg-transparent md:border-none">
          <TabsList className="bg-white border border-slate-200 shadow-sm w-full md:w-auto h-auto overflow-x-auto flex-wrap">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="imports">Importações</TabsTrigger>
            <TabsTrigger value="mappings">Mapeamentos</TabsTrigger>
            <TabsTrigger value="basket">Cesta Básica</TabsTrigger>
            <TabsTrigger value="icpp">ICPP-SP</TabsTrigger>
            <TabsTrigger value="audit">Auditoria</TabsTrigger>
          </TabsList>
        </div>

        {/* ============ ABA 1: RESUMO ============ */}
        <TabsContent value="resumo" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Card lifecycle */}
            <Card className="cb-card lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-brand-600" /> Lifecycle</CardTitle>
                <CardDescription>Criação, validação e fechamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <LinhaLifecycle icon={<User2 className="h-4 w-4 text-slate-500" />} label="Criado por" valor={periodData.criadoPor} data={fmtDataHoraBR(periodData.criado)} />
                <LinhaLifecycle icon={<CheckCircle2 className="h-4 w-4 text-brand-600" />} label="Validado por" valor={periodData.validadoPor ?? '—'} data={periodData.validado ? fmtDataHoraBR(periodData.validado) : '—'} />
                <LinhaLifecycle icon={<Lock className="h-4 w-4 text-emerald-600" />} label="Fechado por" valor={periodData.fechadoPor ?? '—'} data={periodData.fechado ? fmtDataHoraBR(periodData.fechado) : '—'} />
                {periodData.reaberto && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 mb-1">
                      <RotateCcw className="h-3.5 w-3.5" /> Reabertura registrada
                    </div>
                    <div className="text-xs text-amber-800 mb-1">
                      <strong>{periodData.reabertoPor}</strong> · {fmtDataHoraBR(periodData.reaberto)}
                    </div>
                    <div className="text-xs text-amber-900 leading-snug">
                      “{periodData.reabertoJust}”
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card progresso barras */}
            <Card className="cb-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><GitCompare className="h-4 w-4 text-brand-600" /> Progresso do mês</CardTitle>
                <CardDescription>
                  Importação → Matching → ICPP. Tudo em Raw → Canonical → Calculated.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <BarraProgresso etapa="Raw / Bronze" label="Dados brutos importados" feito={periodData.total} total={periodData.total || 1} cor="bg-slate-400" />
                <BarraProgresso etapa="Canonical" label="Itens canônicos reconhecidos" feito={periodData.rec} total={periodData.total || 1} cor="bg-brand-500" />
                <BarraProgresso
                  etapa="Calculated"
                  label="ICPP-SP calculado e homologado"
                  feito={periodData.status === 'CLOSED' || periodData.status === 'VALIDATED' ? 1 : 0}
                  total={1}
                  cor="bg-emerald-500"
                  hint={
                    periodData.status === 'CLOSED'
                      ? 'Calculado e homologado — resultados congelados com hash'
                      : 'ICPP ainda não calculado — motor Sprint 9 após PV1–PV10'
                  }
                />
              </CardContent>
            </Card>
          </div>

          {/* Voltar vs Próxima aba cards */}
          <Card className="cb-card border-dashed border-slate-300 bg-slate-50/40">
            <CardContent className="pt-5 text-sm text-muted-foreground leading-relaxed">
              <ScrollText className="h-4 w-4 inline mr-2 text-brand-600" />
              Esta página é o centro do fechamento mensal. As abas abaixo (Importações, Mapeamentos, Cesta Básica, ICPP-SP, Auditoria)
              permitem rastrear cada número do ICPP até a linha original do Excel que entrou no sistema. Os placeholders desta Sprint
              serão substituídos por consumo real de API nas Sprints 2 a 9.
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ ABA 2: IMPORTAÇÕES (Bronze) ============ */}
        <TabsContent value="imports" className="pt-4">
          <Card className="cb-card">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-brand-600" /> Camada Raw/Bronze — Arquivos importados
                </CardTitle>
                <CardDescription>Nenhum dado é perdido. Tudo preservado com SHA-256.</CardDescription>
              </div>
              <Button disabled>
                <PlusCircle className="h-4 w-4 mr-2" /> Importar novo arquivo
                <span className="ml-2 text-[10px] font-semibold text-brand-200">Sprint 2</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-1">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-muted-foreground border-b border-slate-200">
                      <th className="text-left py-2 pr-4 font-medium">Arquivo</th>
                      <th className="text-left py-2 pr-4 font-medium">Importado por</th>
                      <th className="text-left py-2 pr-4 font-medium">Em</th>
                      <th className="text-left py-2 pr-4 font-medium">Linhas</th>
                      <th className="text-left py-2 pr-4 font-medium">Hash do arquivo (SHA-256)</th>
                      <th className="text-left py-2 font-medium">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {IMPORTS_MOCK_SET26.map(i => (
                      <tr key={i.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/50">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-slate-800">{i.arquivo}</div>
                          <div className="text-xs text-muted-foreground">{i.id}</div>
                        </td>
                        <td className="py-3 pr-4">{i.usuario}</td>
                        <td className="py-3 pr-4">{fmtDataHoraBR(i.data)}</td>
                        <td className="py-3 pr-4 tabular-nums">{i.linhas}</td>
                        <td className="py-3 pr-4 font-mono text-[11px] text-muted-foreground">{i.hash}</td>
                        <td className="py-3">
                          <Button variant="ghost" size="sm" className="h-8 text-xs">Ver raw</Button>
                        </td>
                      </tr>
                    ))}
                    {IMPORTS_MOCK_SET26.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-xs text-muted-foreground">
                          Nenhum arquivo importado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ ABA 3: MAPEAMENTOS (Canonical) ============ */}
        <TabsContent value="mappings" className="pt-4 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard label="Match automático (alias_hash)" value={periodData.rec.toString()} Icon={CheckCircle2} tone="emerald" hint="Fase 1 · 100% confiança" />
            <KpiCard label="Pendentes humano" value={periodData.rev.toString()} Icon={Eye} tone={periodData.rev === 0 ? 'emerald' : 'rose'} hint="Fase 2 · confiança 75-94%" />
            <KpiCard label="Novos este mês" value={periodData.nov.toString()} Icon={PlusCircle} tone="sky" hint="Itens canônicos criados agora" />
          </div>

          <Card className="cb-card border-dashed border-slate-300 bg-slate-50/40">
            <CardHeader>
              <CardTitle className="text-sm">Tela lado a lado de revisão humana</CardTitle>
              <CardDescription>
                Cada item da camada Bronze (descrição original) com sua sugestão da camada Canonical.
                Botões: Confirmar · Buscar outro · Criar novo · Ignorar.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Estrutura preparada. Implementação visual completa na Sprint 4–5.
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ ABA 4: CESTA BÁSICA (Calculated, 1/2) ============ */}
        <TabsContent value="basket" className="pt-4">
          <Card className="cb-card">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-brand-600" /> Composição da Cesta Básica — {fmtCompetencia(periodData.comp)}
                </CardTitle>
                <CardDescription>
                  Peso × Variação = Contribuição. Os pesos aqui são o placeholder da Metodologia V1;
                  valores finais definidos na Sprint 8 após PV1–PV10.
                </CardDescription>
              </div>
              <Badge className="bg-slate-100 text-slate-700 border border-slate-200 font-medium">Placeholder</Badge>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-muted-foreground border-b border-slate-200">
                      <th className="text-left py-2 pr-4 font-medium">Categoria</th>
                      <th className="text-right py-2 pr-4 font-medium">Peso %</th>
                      <th className="text-right py-2 pr-4 font-medium">Variação 12m</th>
                      <th className="text-right py-2 pr-4 font-medium">Contribuição p.p.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CAT_ICPP.map(c => (
                      <tr key={c.cat} className="border-b border-slate-100 last:border-none hover:bg-slate-50/50">
                        <td className="py-2.5 pr-4">{c.cat}</td>
                        <td className="py-2.5 pr-4 text-right tabular-nums">{c.peso.toFixed(2).replace('.',',')}%</td>
                        <td className="py-2.5 pr-4 text-right tabular-nums"><span className="cb-variacao-neg">{c.var.toFixed(2).replace('.',',')}%</span></td>
                        <td className="py-2.5 pr-4 text-right tabular-nums font-medium">+{c.contr.toFixed(2).replace('.',',')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="text-sm border-t-2 border-slate-200">
                      <td className="py-3 pr-4 font-semibold text-slate-800">TOTAL</td>
                      <td className="py-3 pr-4 text-right font-semibold tabular-nums">
                        {CAT_ICPP.reduce((s,c)=>s+c.peso,0).toFixed(2).replace('.',',')}%
                      </td>
                      <td className="py-3 pr-4 text-right text-muted-foreground">—</td>
                      <td className="py-3 pr-4 text-right font-semibold tabular-nums text-brand-700">
                        +{CAT_ICPP.reduce((s,c)=>s+c.contr,0).toFixed(2).replace('.',',')} p.p.
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ ABA 5: ICPP-SP (Calculated, 2/2) ============ */}
        <TabsContent value="icpp" className="pt-4 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KpiCard label="Variação mensal" value={fmtPct(periodData.icppVar)} Icon={TrendingUp} tone={periodData.icppVar === 0 ? 'slate' : 'rose'} hint="Δ(icpp) mês a mês" />
            <KpiCard label="Acumulado 12m" value={fmtPct(periodData.icppAcum12m)} Icon={TrendingUp} tone="rose" hint="I(t)/I(t-12) − 1" />
            <KpiCard label="Acumulado 24m" value={fmtPct(periodData.icppAcum24m)} Icon={TrendingUp} tone="rose" hint="Ago/24 → Set/26" />
            <KpiCard label="Número índice (base AGO/25 = 100)" value={periodData.icppIdxBase100.toFixed(2)} Icon={Database} tone="slate" hint="I(t) = I(t−1)·(1+Δ)" />
          </div>

          <Card className="cb-card">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-brand-600" /> Comparativo com índices oficiais</CardTitle>
              <CardDescription>
                Diferenças em pontos percentuais (p.p.). ICPP-SP = {fmtPct(periodData.icppAcum12m)} acum. 12m.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <CompareCartao titulo="INCC" valor={fmtPct(periodData.inccAcum12m)} diff={periodData.icppAcum12m - periodData.inccAcum12m} />
              <CompareCartao titulo="ICC-SP" valor={fmtPct(periodData.iccSpAcum12m)} diff={periodData.icppAcum12m - periodData.iccSpAcum12m} />
              <CompareCartao titulo="IPCA" valor={fmtPct(periodData.ipcaAcum12m)} diff={periodData.icppAcum12m - periodData.ipcaAcum12m} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ ABA 6: AUDITORIA ============ */}
        <TabsContent value="audit" className="pt-4">
          <Card className="cb-card">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-brand-600" /> Auditoria completa — {fmtCompetencia(periodData.comp)}
              </CardTitle>
              <CardDescription>
                CREATE · UPDATE · FECHOU_COMPETENCIA · REABRIU_COMPETENCIA.
                Cada entrada tem valor_anterior_json e valor_novo_json no banco para recuperação exata.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="relative border-s border-slate-200 ml-3 space-y-5">
                {AUDIT_MOCK_SET26.map(a => (
                  <li key={a.id} className="ms-6">
                    <span className={
                      'absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full border border-white shadow-sm ' +
                      (a.acao === 'CREATE' ? 'bg-sky-500'
                        : a.acao === 'FECHOU_COMPETENCIA' ? 'bg-emerald-500'
                        : a.acao === 'REABRIU_COMPETENCIA' ? 'bg-amber-500'
                        : 'bg-brand-500')
                    }">
                      {a.acao === 'CREATE' && <PlusCircle className="h-3.5 w-3.5 text-white" />}
                      {a.acao === 'UPDATE' && <Eye className="h-3.5 w-3.5 text-white" />}
                      {a.acao === 'FECHOU_COMPETENCIA' && <Lock className="h-3.5 w-3.5 text-white" />}
                      {a.acao === 'REABRIU_COMPETENCIA' && <RotateCcw className="h-3.5 w-3.5 text-white" />}
                    </span>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 mb-1">
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          {a.acao === 'CREATE' && 'Competência criada'}
                          {a.acao === 'UPDATE' && 'Atualização'}
                          {a.acao === 'FECHOU_COMPETENCIA' && 'Competência fechada'}
                          {a.acao === 'REABRIU_COMPETENCIA' && 'Reabertura registrada'}
                        </div>
                        <div className="text-xs text-muted-foreground">por <span className="font-medium text-slate-700">{a.usuario}</span></div>
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">{fmtDataHoraBR(a.data)}</div>
                    </div>
                    <p className="text-sm text-slate-700 leading-snug">{a.obs}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ============= helpers de UI ============= */

function KpiCard({
  label, value, hint, Icon, tone,
}: {
  label: string; value: string; hint?: string;
  Icon: React.ComponentType<{ className?: string }>;
  tone: 'slate' | 'emerald' | 'rose' | 'sky' | 'brand';
}) {
  const toneMap = {
    slate:    { ico: 'text-slate-400',  val: 'text-slate-900' },
    emerald:  { ico: 'text-emerald-500',val: 'text-emerald-700' },
    rose:     { ico: 'text-rose-500',   val: 'text-rose-700' },
    sky:      { ico: 'text-sky-500',    val: 'text-sky-700' },
    brand:    { ico: 'text-brand-500',  val: 'text-brand-700' },
  }[tone];
  return (
    <Card className="cb-card">
      <CardContent className="pt-5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
          <Icon className={'h-4 w-4 ' + toneMap.ico} />
        </div>
        <div className={'mt-2 text-2xl font-semibold tabular-nums ' + toneMap.val}>{value}</div>
        {hint && <div className="mt-1 text-[11px] text-muted-foreground leading-snug">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function LinhaLifecycle({
  icon, label, valor, data,
}: { icon: React.ReactNode; label: string; valor: string; data: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-0.5">{icon} {label}</div>
      <div className="text-sm font-medium text-slate-800">{valor}</div>
      <div className="text-xs text-muted-foreground tabular-nums">{data}</div>
    </div>
  );
}

function BarraProgresso({
  etapa, label, feito, total, cor, hint,
}: { etapa: string; label: string; feito: number; total: number; cor: string; hint?: string }) {
  const pct = total === 0 ? 0 : (feito / total) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <Badge variant="outline" className="border-slate-200 text-slate-600 bg-slate-50 text-[11px] font-semibold mr-2">{etapa}</Badge>
          <span className="text-sm font-medium text-slate-800">{label}</span>
        </div>
        <div className="text-xs font-semibold tabular-nums text-slate-600">{feito}/{total}</div>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={'h-full transition-all duration-500 ' + cor}
          style={{ width: `${pct}%` }}
        />
      </div>
      {hint && <div className="mt-1.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function CompareCartao({ titulo, valor, diff }: { titulo: string; valor: string; diff: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs uppercase font-medium tracking-wide text-muted-foreground">{titulo}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{valor}</div>
      <div className="mt-1 text-xs text-muted-foreground">ICPP − {titulo}</div>
      <div className="text-sm font-semibold tabular-nums text-brand-700">{fmtPP(diff)}</div>
    </div>
  );
}
