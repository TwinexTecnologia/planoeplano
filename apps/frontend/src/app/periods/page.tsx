'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDays, PlusCircle, Lock, CheckCircle2, AlertCircle, Search,
  FileDigit, FileCheck2, Eye, FileX, TrendingUp, ChevronRight, RotateCcw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  fmtCompetencia, fmtDataBR, fmtPct, statusCompetenciaMeta,
  type StatusCompetenciaLabel,
} from '@/lib/utils';

// ====== DADOS MOCK FIÉIS AO SEED / AO PROMPT DO USUÁRIO ======
// Futuramente: trocar por fetch('/api/periods').
type CompetenciaCard = {
  id: string;
  comp: string;
  status: StatusCompetenciaLabel;
  icpp?: number;            // acumulado 12m (mock do Excel)
  total: number | null;
  reconhecidos: number | null;
  revisar: number | null;
  novos: number | null;
  criado_em: string;
  validado_em?: string | null;
  fechado_em?: string | null;
  descricao?: string | null;
};

const COMPETENCIAS: CompetenciaCard[] = [
  // ------- Últimos 2 meses (destaque do usuário) -------
  {
    id: 'period_202609',
    comp: '202609',
    status: 'CLOSED',
    icpp: 5.61,
    total: 853, reconhecidos: 853, revisar: 0, novos: 0,
    criado_em: '2026-09-01T09:00:00-03:00',
    validado_em: '2026-09-30T17:00:00-03:00',
    fechado_em:  '2026-09-30T18:00:00-03:00',
    descricao: 'SET/26 — Competência de referência (base do gráfico AGO/25→SET/26)',
  },
  {
    id: 'period_202610',
    comp: '202610',
    status: 'REVIEW',
    total: 867, reconhecidos: 812, revisar: 55, novos: 42,
    criado_em: '2026-10-01T09:15:00-03:00',
    descricao: 'OUT/26 — Em revisão humana de matching',
  },
  // ------- Histórico fechado (AGO/25 → AGO/26) -------
  { id: 'p202608', comp: '202608', status: 'CLOSED', icpp: 5.42, total: 841, reconhecidos: 841, revisar: 0, novos: 0, criado_em: '2026-08-01T09:00:00-03:00', fechado_em: '2026-08-29T18:00:00-03:00' },
  { id: 'p202607', comp: '202607', status: 'CLOSED', icpp: 5.18, total: 835, reconhecidos: 835, revisar: 0, novos: 0, criado_em: '2026-07-01T09:00:00-03:00', fechado_em: '2026-07-31T18:00:00-03:00' },
  { id: 'p202606', comp: '202606', status: 'CLOSED', icpp: 4.97, total: 828, reconhecidos: 828, revisar: 0, novos: 0, criado_em: '2026-06-01T09:00:00-03:00', fechado_em: '2026-06-30T18:00:00-03:00' },
  { id: 'p202605', comp: '202605', status: 'CLOSED', icpp: 4.81, total: 819, reconhecidos: 819, revisar: 0, novos: 0, criado_em: '2026-05-01T09:00:00-03:00', fechado_em: '2026-05-29T18:00:00-03:00' },
  { id: 'p202604', comp: '202604', status: 'CLOSED', icpp: 4.52, total: 807, reconhecidos: 807, revisar: 0, novos: 0, criado_em: '2026-04-01T09:00:00-03:00', fechado_em: '2026-04-30T18:00:00-03:00' },
  { id: 'p202603', comp: '202603', status: 'CLOSED', icpp: 4.20, total: 799, reconhecidos: 799, revisar: 0, novos: 0, criado_em: '2026-03-01T09:00:00-03:00', fechado_em: '2026-03-31T18:00:00-03:00' },
  { id: 'p202602', comp: '202602', status: 'CLOSED', icpp: 3.91, total: 788, reconhecidos: 788, revisar: 0, novos: 0, criado_em: '2026-02-01T09:00:00-03:00', fechado_em: '2026-02-28T18:00:00-03:00' },
  { id: 'p202601', comp: '202601', status: 'CLOSED', icpp: 3.73, total: 781, reconhecidos: 781, revisar: 0, novos: 0, criado_em: '2026-01-01T09:00:00-03:00', fechado_em: '2026-01-30T18:00:00-03:00' },
  { id: 'p202512', comp: '202512', status: 'CLOSED', icpp: 3.50, total: 775, reconhecidos: 775, revisar: 0, novos: 0, criado_em: '2025-12-01T09:00:00-03:00', fechado_em: '2025-12-30T18:00:00-03:00' },
  { id: 'p202511', comp: '202511', status: 'CLOSED', icpp: 3.22, total: 768, reconhecidos: 768, revisar: 0, novos: 0, criado_em: '2025-11-01T09:00:00-03:00', fechado_em: '2025-11-28T18:00:00-03:00' },
  { id: 'p202510', comp: '202510', status: 'CLOSED', icpp: 2.98, total: 760, reconhecidos: 760, revisar: 0, novos: 0, criado_em: '2025-10-01T09:00:00-03:00', fechado_em: '2025-10-31T18:00:00-03:00' },
  { id: 'p202509', comp: '202509', status: 'CLOSED', icpp: 2.73, total: 753, reconhecidos: 753, revisar: 0, novos: 0, criado_em: '2025-09-01T09:00:00-03:00', fechado_em: '2025-09-30T18:00:00-03:00' },
  { id: 'p202508', comp: '202508', status: 'CLOSED', icpp: 0.00, total: 741, reconhecidos: 741, revisar: 0, novos: 0, criado_em: '2025-08-01T09:00:00-03:00', fechado_em: '2025-08-29T18:00:00-03:00', descricao: 'AGO/25 — Base 100 do gráfico de acumulado 12m' },
];

const FLUXO = [
  { key: 'DRAFT',      label: 'Rascunho',    icon: PlusCircle, desc: 'Competência criada, ainda sem importação' },
  { key: 'PROCESSING', label: 'Processando', icon: Search,     desc: 'Arquivo importado, matching em andamento' },
  { key: 'REVIEW',     label: 'Em revisão',  icon: AlertCircle,desc: 'Itens pendentes de mapeamento humano' },
  { key: 'VALIDATED',  label: 'Validado',    icon: CheckCircle2,desc: 'ICPP-SP validado, pronto p/ fechar' },
  { key: 'CLOSED',     label: 'Fechado',     icon: Lock,       desc: 'Histórico congelado. Reabre c/ auditoria' },
];

export default function PeriodsPage() {
  const router = useRouter();
  const [filtroStatus, setFiltroStatus] = React.useState<StatusCompetenciaLabel | 'TODOS'>('TODOS');
  const [busca, setBusca] = React.useState('');

  const filtrado = React.useMemo(() => {
    return COMPETENCIAS.filter(c => {
      if (filtroStatus !== 'TODOS' && c.status !== filtroStatus) return false;
      if (busca) {
        const b = busca.trim().toLowerCase();
        if (
          !fmtCompetencia(c.comp).toLowerCase().includes(b) &&
          !c.comp.includes(b) &&
          !(c.descricao || '').toLowerCase().includes(b)
        ) return false;
      }
      return true;
    });
  }, [filtroStatus, busca]);

  const totais = React.useMemo(() => {
    return {
      qtd: COMPETENCIAS.length,
      fechadas: COMPETENCIAS.filter(c => c.status === 'CLOSED').length,
      abertas:  COMPETENCIAS.filter(c => c.status !== 'CLOSED').length,
      revisar:  COMPETENCIAS.reduce((s, c) => s + (c.revisar || 0), 0),
    };
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* ---------------- Header ---------------- */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Competências</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Ciclo mensal da Cesta Básica. Cada competência tem seu próprio status, arquivos importados,
            mapeamentos e resultado do ICPP-SP congelado ao fechar.
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar SET/26, descrição..."
            className="max-w-[260px]"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          <Link href="/periods/new" passHref>
            <Button className="bg-brand-500 hover:bg-brand-600">
              <PlusCircle className="h-4 w-4 mr-2" />
              Cadastrar mês
            </Button>
          </Link>
        </div>
      </header>

      {/* ---------------- KPIs do módulo ---------------- */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cb-card">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Total no histórico</div>
              <CalendarDays className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-end gap-2">
              <div className="text-2xl font-semibold text-slate-900">{totais.qtd}</div>
              <div className="text-xs text-muted-foreground pb-1">competências</div>
            </div>
          </CardContent>
        </Card>

        <Card className="cb-card">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Fechadas</div>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-end gap-2">
              <div className="text-2xl font-semibold text-emerald-700">{totais.fechadas}</div>
              <div className="text-xs text-muted-foreground pb-1">congeladas</div>
            </div>
          </CardContent>
        </Card>

        <Card className="cb-card">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Abertas</div>
              <RotateCcw className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-end gap-2">
              <div className="text-2xl font-semibold text-amber-700">{totais.abertas}</div>
              <div className="text-xs text-muted-foreground pb-1">em andamento</div>
            </div>
          </CardContent>
        </Card>

        <Card className="cb-card">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Pendentes de revisão</div>
              <AlertCircle className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-end gap-2">
              <div className="text-2xl font-semibold text-rose-700">{totais.revisar}</div>
              <div className="text-xs text-muted-foreground pb-1">itens p/ humano</div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ---------------- Fluxo 5 status ---------------- */}
      <section className="cb-card">
        <CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-4">
            <FileDigit className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-semibold text-slate-800">Fluxo de status da competência</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {FLUXO.map((f, i) => {
              const Icon = f.icon;
              const isLast = i === FLUXO.length - 1;
              return (
                <div key={f.key} className="relative">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col h-full">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[11px] uppercase tracking-wide">{f.key}</Badge>
                      <Icon className="h-4 w-4 text-brand-600" />
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-800">{f.label}</div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed flex-1">{f.desc}</p>
                  </div>
                  {!isLast && (
                    <ChevronRight className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 h-6 w-6 text-slate-300 bg-white rounded-full border border-slate-200 p-1" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </section>

      <Separator />

      {/* ---------------- Filtros ---------------- */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(['TODOS', 'DRAFT', 'PROCESSING', 'REVIEW', 'VALIDATED', 'CLOSED'] as const).map(k => {
            const ativo = filtroStatus === k;
            return (
              <button
                key={k}
                onClick={() => setFiltroStatus(k)}
                className={
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition ' +
                  (ativo
                    ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')
                }
              >
                {k === 'TODOS' ? 'Todas' : statusCompetenciaMeta(k).label}
              </button>
            );
          })}
        </div>
        <div className="text-xs text-muted-foreground">
          {filtrado.length} de {COMPETENCIAS.length} competências
        </div>
      </section>

      {/* ---------------- LISTA DE CARDS VISUAL ---------------- */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtrado.map(c => <CompetenciaCardItem key={c.id} c={c} onClick={() => router.push(`/periods/${c.id}`)} />)}
        {filtrado.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 py-16 text-center text-sm text-muted-foreground bg-slate-50/50">
            Nenhuma competência encontrada para os filtros selecionados.
          </div>
        )}
      </section>
    </div>
  );
}

// ==========================================================
// CARD VISUAL — exatamente como o usuário pediu:
//   SET/26 — Fechado           OUT/26 — Em revisão
//   ICPP: 5,61% | 853 itens   867 itens | 812 rec. | 55 rev.
//   0 pendências               42 novos
// ==========================================================
function CompetenciaCardItem({ c, onClick }: { c: CompetenciaCard; onClick: () => void }) {
  const meta = statusCompetenciaMeta(c.status);
  const destaque = c.comp === '202609' || c.comp === '202610';

  return (
    <button
      onClick={onClick}
      className={
        'group text-left rounded-2xl border bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 ' +
        (destaque
          ? 'border-brand-200 shadow-sm ring-1 ring-brand-500/10 hover:shadow-brand-500/10 hover:ring-brand-500/20'
          : 'border-slate-200 hover:border-brand-200/70')
      }
    >
      {/* Linha de destaque superior (cor do status) */}
      <div className={'-mx-5 -mt-5 h-1.5 rounded-t-2xl mb-4 ' +
        (c.status === 'CLOSED' ? 'bg-emerald-500'
          : c.status === 'VALIDATED' ? 'bg-brand-500'
          : c.status === 'REVIEW' || c.status === 'PROCESSING' ? 'bg-amber-500'
          : 'bg-slate-400')} />

      {/* Header: competência + badge status */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              {fmtCompetencia(c.comp)}
            </h3>
            <span className="text-slate-300">—</span>
            <Badge className={meta.tone + ' border font-medium'} variant="outline">
              {meta.label}
            </Badge>
          </div>
          {c.descricao && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{c.descricao}</p>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition" />
      </div>

      <Separator className="my-4" />

      {/* ICPP + itens / reconhecidos / revisar / novos */}
      <div className="space-y-3">
        {c.icpp !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> ICPP (acum. 12m)
            </div>
            <div className="text-base font-semibold text-slate-900 tabular-nums">
              {fmtPct(c.icpp)}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-700">
          <span className="inline-flex items-center gap-1 tabular-nums">
            <FileDigit className="h-3.5 w-3.5 text-slate-400" />
            <strong className="font-semibold">{c.total ?? 0}</strong> itens
          </span>
          {c.reconhecidos !== null && c.reconhecidos !== undefined && (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <FileCheck2 className="h-3.5 w-3.5 text-emerald-500" />
              <strong className="font-semibold text-emerald-700">{c.reconhecidos}</strong> reconhecidos
            </span>
          )}
          {(c.revisar ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Eye className="h-3.5 w-3.5 text-amber-600" />
              <strong className="font-semibold text-amber-700">{c.revisar}</strong> para revisar
            </span>
          )}
          {(c.novos ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <PlusCircle className="h-3.5 w-3.5 text-sky-600" />
              <strong className="font-semibold text-sky-700">{c.novos}</strong> novos
            </span>
          )}
        </div>

        {/* 0 pendências? ou tem pendência? */}
        <div className="text-xs flex items-center justify-between pt-2 border-t border-slate-100">
          {(c.revisar ?? 0) === 0 ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> 0 pendências
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-rose-700 font-medium">
              <AlertCircle className="h-3.5 w-3.5" /> {c.revisar} pendências
            </span>
          )}
          <span className="text-muted-foreground">
            Fech.: <span className="tabular-nums">{c.fechado_em ? fmtDataBR(c.fechado_em) : '—'}</span>
          </span>
        </div>
      </div>
    </button>
  );
}
