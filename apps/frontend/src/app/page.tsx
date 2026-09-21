'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Eye,
  Package,
  PackageSearch,
  TrendingUp,
  ChevronRight,
  Filter,
  Download,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn, fmtPct, fmtPP, varClass } from '@/lib/utils';

// ---------- Dados MOCK (baseados no Excel real) ----------
// Substituir depois por API: GET /icpp/{period} + GET /periods/{id}/summary
const PERIODO_ATUAL = { competencia: '202609', label: 'SET/26', status: 'Em revisão' };

const KPIS = [
  {
    label: 'Itens no mês',
    value: '853',
    sub: '+12 vs. AGO/26',
    icon: Package,
    accent: 'bg-brand-50 text-brand-600',
  },
  {
    label: 'Itens reconhecidos',
    value: '798',
    sub: '93,5% da base',
    icon: CheckCircle2,
    accent: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'Itens para revisar',
    value: '55',
    sub: '-8 vs. AGO/26',
    icon: PackageSearch,
    accent: 'bg-amber-50 text-amber-600',
    badge: { href: '/mapping', label: 'Revisar agora' },
  },
  {
    label: 'ICPP-SP 12 meses',
    value: '+5,61%',
    sub: 'Acumulado AGO/25 → SET/26',
    icon: TrendingUp,
    accent: 'bg-brand-50 text-brand-600',
    variacao: 5.61,
  },
  {
    label: 'INCC 12 meses',
    value: '+6,59%',
    sub: 'FGV · Índice Nacional',
    icon: Sparkles,
    accent: 'bg-blue-50 text-blue-600',
    variacao: 6.59,
  },
  {
    label: 'ICPP × INCC',
    value: '−0,98 p.p.',
    sub: 'Abaixo do INCC',
    icon: ArrowDownRight,
    accent: 'bg-emerald-50 text-emerald-600',
    positivo: true,
  },
];

// Acumulado 12 meses base 100 em ago/25 (alinhado com o gráfico do Excel)
const SERIES_INDICES = [
  { mes: 'ago/25', 'ICPP-SP': 100.00, INCC: 100.00, 'ICC-SP': 100.00, IPCA: 100.00 },
  { mes: 'set/25', 'ICPP-SP': 100.30, INCC: 100.41, 'ICC-SP': 100.50, IPCA: 100.24 },
  { mes: 'out/25', 'ICPP-SP': 100.40, INCC: 100.80, 'ICC-SP': 101.10, IPCA: 100.70 },
  { mes: 'nov/25', 'ICPP-SP': 100.50, INCC: 101.20, 'ICC-SP': 101.80, IPCA: 101.00 },
  { mes: 'dez/25', 'ICPP-SP': 100.55, INCC: 101.60, 'ICC-SP': 102.30, IPCA: 101.40 },
  { mes: 'jan/26', 'ICPP-SP': 101.00, INCC: 102.00, 'ICC-SP': 103.00, IPCA: 101.50 },
  { mes: 'fev/26', 'ICPP-SP': 101.60, INCC: 102.80, 'ICC-SP': 103.90, IPCA: 102.00 },
  { mes: 'mar/26', 'ICPP-SP': 102.20, INCC: 103.40, 'ICC-SP': 104.40, IPCA: 102.40 },
  { mes: 'abr/26', 'ICPP-SP': 103.50, INCC: 104.00, 'ICC-SP': 104.90, IPCA: 103.00 },
  { mes: 'mai/26', 'ICPP-SP': 105.00, INCC: 104.80, 'ICC-SP': 105.70, IPCA: 103.40 },
  { mes: 'jun/26', 'ICPP-SP': 105.40, INCC: 105.50, 'ICC-SP': 106.50, IPCA: 103.80 },
  { mes: 'jul/26', 'ICPP-SP': 105.45, INCC: 105.90, 'ICC-SP': 107.00, IPCA: 104.00 },
  { mes: 'ago/26', 'ICPP-SP': 105.58, INCC: 106.40, 'ICC-SP': 107.20, IPCA: 104.18 },
  { mes: 'set/26', 'ICPP-SP': 105.61, INCC: 106.59, 'ICC-SP': 107.35, IPCA: 104.22 },
];

const CORES = {
  'ICPP-SP': '#ef4444',  // vermelho da planilha
  INCC:     '#2563eb',  // azul
  'ICC-SP': '#6b7280',  // cinza
  IPCA:     '#7c3aed',  // roxo
};

// Tabela de variação por categoria (item 31 do prompt)
const TABELA_CATEGORIAS = [
  { cat: 'MAT Bloco de Concreto',    peso: 7.65, var: 8.14, contr: 0.62 },
  { cat: 'MAT Concreto',              peso: 3.90, var: 5.45, contr: 0.21 },
  { cat: 'MAT Graute Usinado',        peso: 1.16, var: 3.42, contr: 0.04 },
  { cat: 'MAT Graute Silo',           peso: 0.74, var: 8.13, contr: 0.06 },
  { cat: 'MAT Aço',                   peso: 2.95, var: 4.15, contr: 0.12 },
  { cat: 'MAT Tela Aço',              peso: 0.06, var: 4.50, contr: 0.03 },
  { cat: 'EMP Instalações',           peso: 18.63,var: 6.00, contr: 1.12 },
  { cat: 'MAT Barramento',            peso: 1.14, var: 0.00, contr: 0.00 },
  { cat: 'MAT Cabos Entrada',         peso: 0.71, var: 0.00, contr: 0.00 },
  { cat: 'MAT Cerâmica',              peso: 0.70, var: 8.40, contr: 0.06 },
  { cat: 'MO ALVENARIA',              peso: 6.67, var: 5.99, contr: 0.40 },
  { cat: 'MO Estrutural',             peso: 4.05, var: 6.10, contr: 0.25 },
  { cat: 'Elevadores',                peso: 4.37, var: 9.78, contr: 0.43 },
  { cat: 'MAT Esquadrias de Alumínio',peso: 2.10, var: 2.42, contr: 0.05 },
  { cat: 'MAT Argamassa',             peso: 1.47, var: 7.77, contr: 0.11 },
];

const COMPETENCIAS_RECENTES = [
  { comp: '202610', label: 'OUT/26', status: 'Em preparação', badgeVariant: 'secondary' as const, items: 0 },
  { comp: '202609', label: 'SET/26', status: 'Em revisão',     badgeVariant: 'warn' as const,      items: 853 },
  { comp: '202608', label: 'AGO/26', status: 'Fechado',        badgeVariant: 'success' as const,   items: 841 },
  { comp: '202607', label: 'JUL/26', status: 'Fechado',        badgeVariant: 'success' as const,   items: 835 },
  { comp: '202606', label: 'JUN/26', status: 'Fechado',        badgeVariant: 'success' as const,   items: 828 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Olá, Alex!</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              Último acesso hoje às 09:41
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            Cesta Básica — <span className="text-brand-600">{PERIODO_ATUAL.label}</span>
            <Badge variant="warn" className="ml-3 align-middle">{PERIODO_ATUAL.status}</Badge>
          </h1>
          <p className="mt-1 text-muted-foreground">
            Visão consolidada do mês e evolução histórica do ICPP-SP comparado aos índices de mercado.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" /> Período
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Exportar
          </Button>
          <Link href="/periods/new" passHref>
            <Button size="sm">
              <ChevronRight className="h-4 w-4 mr-1 -ml-1" /> Nova competência
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPIS.map(kpi => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="cb-kpi-label">{kpi.label}</div>
                    <div className={cn('cb-kpi-value mt-1.5', 'variacao' in kpi ? varClass(kpi.variacao as number, false) : '')}>
                      {kpi.value}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{kpi.sub}</div>
                  </div>
                  <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', kpi.accent)}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                </div>
                {'badge' in kpi && kpi.badge && (
                  <Link href={kpi.badge.href} className="mt-3 inline-flex text-xs font-medium text-brand-600 hover:text-brand-700 items-center gap-1">
                    {kpi.badge.label} <ChevronRight className="h-3 w-3" />
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráfico principal + Comparativo lado a lado */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Evolução Acumulado 12 meses
                <Badge variant="outline" className="font-normal">AGO/25 → SET/26</Badge>
              </CardTitle>
              <CardDescription>Base 100 no primeiro mês da janela. Clique nas séries para habilitar/desabilitar.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Mensal</Button>
              <Button variant="default" size="sm">12 meses</Button>
              <Button variant="outline" size="sm">24 meses</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="h-[340px] w-full">
              <ResponsiveContainer>
                <LineChart data={SERIES_INDICES} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#e2e8f0" />
                  <YAxis domain={[99, 109]} tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#e2e8f0" tickFormatter={v => v.toFixed(0)} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                    formatter={(v: number) => [v.toFixed(2), '']}
                  />
                  <Legend iconType="line" wrapperStyle={{ fontSize: 12 }} />
                  {(Object.keys(CORES) as Array<keyof typeof CORES>).map(k => (
                    <Line key={k} type="monotone" dataKey={k} stroke={CORES[k]} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border">
              {[
                { k: 'ICPP-SP', v: 5.61,  cor: CORES['ICPP-SP'], extra: 'Índice próprio' },
                { k: 'INCC',     v: 6.59,  cor: CORES.INCC,      extra: 'FGV' },
                { k: 'ICC-SP',   v: 7.35,  cor: CORES['ICC-SP'], extra: 'Padrão Econômico' },
                { k: 'IPCA',     v: 4.22,  cor: CORES.IPCA,      extra: 'IBGE' },
              ].map(item => (
                <div key={item.k} className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.cor }} />
                    <div>
                      <div className="text-sm font-semibold leading-tight">{item.k}</div>
                      <div className="text-[11px] text-muted-foreground">{item.extra}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{fmtPct(item.v)}</div>
                    {item.k !== 'ICPP-SP' && (
                      <div className={cn('text-[11px]', varClass(5.61 - item.v, true))}>
                        {fmtPP(5.61 - item.v)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card direito: Comparativo + Entender composição */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comparativo SET/26</CardTitle>
              <CardDescription>Acumulado 12 meses vs. ICPP-SP</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0 -mt-2">
              {[
                { i: 'ICPP-SP', v: 5.61,  diff: null,  badge: true },
                { i: 'INCC',     v: 6.59,  diff: -0.98 },
                { i: 'ICC-SP',   v: 7.35,  diff: -1.74 },
                { i: 'IPCA',     v: 4.22,  diff: +1.39 },
              ].map((l, idx) => (
                <div key={l.i}
                     className={cn('flex items-center justify-between py-3 text-sm',
                                   idx !== 3 && 'border-b border-border/70')}>
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full"
                          style={{ background: CORES[l.i as keyof typeof CORES] }} />
                    <span className="font-medium">{l.i}</span>
                    {l.badge && <Badge variant="default" className="text-[10px] px-1.5 py-0">próprio</Badge>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold tabular-nums min-w-[58px] text-right">
                      {fmtPct(l.v)}
                    </span>
                    <span className="tabular-nums min-w-[82px] text-right text-xs">
                      {l.diff === null
                        ? <span className="text-muted-foreground">—</span>
                        : <span className={cn(varClass(l.diff, true))}>{fmtPP(l.diff)}</span>}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-brand-200/70 bg-gradient-to-br from-brand-50 via-white to-white">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(85,87,246,0.6)]">
                  <Eye className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-brand-800">Entender composição do ICPP</div>
                  <p className="text-[13px] text-brand-700/80 mt-1 leading-relaxed">
                    De onde veio o +5,61%? Desça do índice geral para a categoria, depois para o item, até o histórico do preço e a descrição utilizada no mês.
                  </p>
                  <Link href="/icpp" passHref>
                    <Button size="sm" className="mt-4">
                      Abrir drill-down <ChevronRight className="h-4 w-4 ml-1 -mr-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Competências recentes</CardTitle>
              </div>
              <Link href="/periods" className="text-xs font-medium text-brand-600 hover:text-brand-700 inline-flex items-center">
                Ver todas <ChevronRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-1 -mt-1">
              {COMPETENCIAS_RECENTES.map(c => (
                <Link key={c.comp} href={`/periods/${c.comp}`} passHref
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center font-semibold text-xs text-muted-foreground">
                      {c.label.slice(0, 3)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{c.label}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {c.items ? `${c.items} itens` : 'Sem itens'}
                      </div>
                    </div>
                  </div>
                  <Badge variant={c.badgeVariant}>{c.status}</Badge>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabela: Variação por categoria */}
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>Variação por Categoria — SET/26</CardTitle>
            <CardDescription>
              Peso × Variação = Contribuição em pontos percentuais para o ICPP-SP do mês.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-1.5" /> CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden cb-scrollbar-thin overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Categoria</th>
                  <th className="px-4 py-3 font-semibold text-right">Peso</th>
                  <th className="px-4 py-3 font-semibold text-right">Variação</th>
                  <th className="px-4 py-3 font-semibold text-right">Contribuição (p.p.)</th>
                  <th className="px-4 py-3 font-semibold text-left w-1/3">Impacto</th>
                </tr>
              </thead>
              <tbody>
                {TABELA_CATEGORIAS.map((l, i) => {
                  const maxBar = 2.0;
                  const pct = Math.min(100, Math.abs(l.contr) / maxBar * 100);
                  return (
                    <tr key={l.cat}
                        className={cn('border-t border-border hover:bg-muted/30 transition-colors',
                                      i === 0 && 'border-t-0')}>
                      <td className="px-4 py-3 font-medium">{l.cat}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{fmtPct(l.peso)}</td>
                      <td className={cn('px-4 py-3 text-right tabular-nums font-medium', varClass(l.var, false))}>
                        {fmtPct(l.var)}
                      </td>
                      <td className={cn('px-4 py-3 text-right tabular-nums font-semibold', varClass(l.contr, false))}>
                        {fmtPP(l.contr)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              l.contr >= 0 ? 'bg-status-down/80' : 'bg-status-up/80',
                            )}
                            style={{ width: pct + '%' }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/30 text-sm font-semibold">
                  <td className="px-4 py-3">TOTAL ICPP-SP</td>
                  <td className="px-4 py-3 text-right tabular-nums">100,00%</td>
                  <td className="px-4 py-3 text-right tabular-nums text-brand-600">+5,61%</td>
                  <td className="px-4 py-3 text-right tabular-nums text-brand-600">+5,61 p.p.</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div className="rounded-xl border border-dashed border-border p-5 bg-card/50">
          <div className="font-semibold flex items-center gap-2">
            <Badge variant="secondary">PENDENTE</Badge>
            <span>PV1–PV10</span>
          </div>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            10 questões sobre a fórmula do ICPP (mês-base pesos, tratamento de itens sem preço,
            entrada/saída da cesta, coluna "NÃO UTILIZAR", etc.) aguardam validação do dono do
            processo. Sem elas, o motor cálculo fica apenas como placeholder.
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-border p-5 bg-card/50">
          <div className="font-semibold flex items-center gap-2">
            <Badge variant="secondary">CAMADAS</Badge>
            Arquitetura
          </div>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Raw:</span> import_rows.raw_row_json + imports.hash_arquivo<br />
            <span className="font-medium text-foreground">Canonical:</span> canonical_items + aliases + item_prices<br />
            <span className="font-medium text-foreground">Calculated:</span> basket_weights + icpp_results + category_results
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-border p-5 bg-card/50">
          <div className="font-semibold flex items-center gap-2">
            <Badge variant="secondary">PRÓXIMO</Badge>
            Dataset
          </div>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            Para validar o matching de aliases e o cálculo do ICPP, forneça 2 competências
            consecutivas (ex: AGO/26 e SET/26) — o critério de aceite é reproduzir EXATAMENTE os
            resultados do Excel dentro da tolerância definida.
          </p>
        </div>
      </div>
    </div>
  );
}
