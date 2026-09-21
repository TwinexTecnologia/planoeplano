import * as React from 'react';
import Link from 'next/link';
import { Eye, Filter, Download, ChevronRight, ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { fmtPct, fmtPP, varClass, cn } from '@/lib/utils';

const CORES = {
  'ICPP-SP': '#ef4444',
  INCC:     '#2563eb',
  'ICC-SP': '#6b7280',
  IPCA:     '#7c3aed',
};

const SERIES = [
  { mes: 'ago/25', 'ICPP-SP': 0.00, INCC: 0.00, 'ICC-SP': 0.00, IPCA: 0.00 },
  { mes: 'set/25', 'ICPP-SP': 0.30, INCC: 0.41, 'ICC-SP': 0.50, IPCA: 0.24 },
  { mes: 'out/25', 'ICPP-SP': 0.40, INCC: 0.80, 'ICC-SP': 1.10, IPCA: 0.70 },
  { mes: 'nov/25', 'ICPP-SP': 0.50, INCC: 1.20, 'ICC-SP': 1.80, IPCA: 1.00 },
  { mes: 'dez/25', 'ICPP-SP': 0.55, INCC: 1.60, 'ICC-SP': 2.30, IPCA: 1.40 },
  { mes: 'jan/26', 'ICPP-SP': 1.00, INCC: 2.00, 'ICC-SP': 3.00, IPCA: 1.50 },
  { mes: 'fev/26', 'ICPP-SP': 1.60, INCC: 2.80, 'ICC-SP': 3.90, IPCA: 2.00 },
  { mes: 'mar/26', 'ICPP-SP': 2.20, INCC: 3.40, 'ICC-SP': 4.40, IPCA: 2.40 },
  { mes: 'abr/26', 'ICPP-SP': 3.50, INCC: 4.00, 'ICC-SP': 4.90, IPCA: 3.00 },
  { mes: 'mai/26', 'ICPP-SP': 5.00, INCC: 4.80, 'ICC-SP': 5.70, IPCA: 3.40 },
  { mes: 'jun/26', 'ICPP-SP': 5.40, INCC: 5.50, 'ICC-SP': 6.50, IPCA: 3.80 },
  { mes: 'jul/26', 'ICPP-SP': 5.45, INCC: 5.90, 'ICC-SP': 7.00, IPCA: 4.00 },
  { mes: 'ago/26', 'ICPP-SP': 5.58, INCC: 6.40, 'ICC-SP': 7.20, IPCA: 4.18 },
  { mes: 'set/26', 'ICPP-SP': 5.61, INCC: 6.59, 'ICC-SP': 7.35, IPCA: 4.22 },
];

const COMPARATIVO = [
  { i: 'ICPP-SP', v12: 5.61, v24: 12.31, v_mensal: -0.01, badge: 'próprio' },
  { i: 'INCC',     v12: 6.59, v24: 13.82, v_mensal:  0.19, diff: -0.98 },
  { i: 'ICC-SP',   v12: 7.35, v24: 14.90, v_mensal:  0.15, diff: -1.74 },
  { i: 'IPCA',     v12: 4.22, v24:  9.15, v_mensal: -0.32, diff: +1.39 },
];

const CATEGORIAS = [
  { cat: 'EMP Instalações',            peso: 18.63, var: 6.00, contr: 1.12 },
  { cat: 'MO ALV + ESTRUTURAL',        peso: 10.72, var: 6.00, contr: 0.64 },
  { cat: 'MAT Bloco de Concreto',      peso: 7.65,  var: 8.14, contr: 0.62 },
  { cat: 'Elevadores',                 peso: 4.37,  var: 9.78, contr: 0.43 },
  { cat: 'MO ALVENARIA',               peso: 6.67,  var: 5.99, contr: 0.40 },
  { cat: 'MAT Concreto',               peso: 3.90,  var: 5.45, contr: 0.21 },
  { cat: 'MAT Aço',                    peso: 2.95,  var: 4.15, contr: 0.12 },
  { cat: 'MAT Argamassa',              peso: 1.47,  var: 7.77, contr: 0.11 },
  { cat: 'MAT Esquadrias de Alumínio', peso: 2.10,  var: 2.42, contr: 0.05 },
  { cat: 'Outras 32 categorias',       peso: 41.54, var: 4.10, contr: 1.91 },
];

export default function IcppPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2">
            <Badge variant="default">ICPP-SP</Badge>
            <Badge variant="outline">Metodologia V1</Badge>
            <Badge variant="warn">SET/26 · Em revisão</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-2">
            Painel ICPP-SP
          </h1>
          <p className="mt-1 text-muted-foreground">
            Evolução do índice próprio comparado com INCC, ICC-SP e IPCA.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" /> Período · 12 meses</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Exportar</Button>
        </div>
      </header>

      {/* 4 cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-4 lg:max-w-none">
          {/* ocupa 4 colunas vazias; real abaixo */}
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 -mt-[72px] relative z-10">
        <Card className="border-brand-200 bg-gradient-to-br from-brand-50 to-white">
          <CardContent className="p-5">
            <div className="cb-kpi-label">SET/26 · Variação mensal</div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-semibold tracking-tight text-status-down">-0,01%</span>
              <ArrowDownRight className="h-4 w-4 text-status-down" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              vs. AGO/26 · −0,59% no mês anterior
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="cb-kpi-label">Acumulado 12 meses</div>
            <div className="text-3xl font-semibold tracking-tight mt-1.5">+5,61%</div>
            <div className="text-xs text-muted-foreground mt-1">AGO/25 → SET/26</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="cb-kpi-label">Acumulado 24 meses</div>
            <div className="text-3xl font-semibold tracking-tight mt-1.5">+12,31%</div>
            <div className="text-xs text-muted-foreground mt-1">SET/24 → SET/26</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-5">
            <div className="cb-kpi-label">ICPP × INCC · 12m</div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-semibold tracking-tight text-emerald-600">−0,98 p.p.</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Abaixo do índice nacional da construção
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico + Tabela comparativo */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Acumulado 12 meses · ICPP-SP × Índices</CardTitle>
              <CardDescription>Base 0 no início da janela. Valores = % acumulado.</CardDescription>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm">Mensal</Button>
              <Button variant="default" size="sm">12 meses</Button>
              <Button variant="outline" size="sm">24 meses</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[360px]">
              <ResponsiveContainer>
                <LineChart data={SERIES} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#e2e8f0" />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#e2e8f0" tickFormatter={v => v.toFixed(1) + '%'} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                    formatter={(v: number) => [v.toFixed(2) + '%', '']} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {(Object.keys(CORES) as any[]).map(k => (
                    <Line key={k} type="monotone" dataKey={k} stroke={CORES[k as keyof typeof CORES]} strokeWidth={2.75} dot={false} activeDot={{ r: 4 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comparativo SET/26</CardTitle>
            <CardDescription>Diferenças em pontos percentuais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-0 -mt-2">
            <div className="grid grid-cols-5 px-3 py-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border">
              <div className="col-span-2">Indicador</div>
              <div className="col-span-1 text-right">12m</div>
              <div className="col-span-1 text-right">24m</div>
              <div className="col-span-1 text-right">Dif. ICPP</div>
            </div>
            {COMPARATIVO.map((l, i) => (
              <div key={l.i} className={cn(
                'grid grid-cols-5 items-center px-3 py-3 text-sm',
                i !== COMPARATIVO.length - 1 && 'border-b border-border/70',
              )}>
                <div className="col-span-2 flex items-center gap-2 min-w-0">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: CORES[l.i as keyof typeof CORES] }} />
                  <span className="font-medium truncate">{l.i}</span>
                  {l.badge && <Badge variant="default" className="text-[10px] px-1.5 py-0">{l.badge}</Badge>}
                </div>
                <div className="col-span-1 text-right tabular-nums font-semibold">{fmtPct(l.v12)}</div>
                <div className="col-span-1 text-right tabular-nums text-muted-foreground">{fmtPct(l.v24)}</div>
                <div className="col-span-1 text-right tabular-nums text-xs">
                  {l.diff === undefined ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <span className={cn('font-medium', varClass(l.diff, true))}>{fmtPP(l.diff)}</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Entender composição */}
      <Card className="border-brand-200 bg-gradient-to-br from-brand-50/60 via-white to-white">
        <CardHeader className="flex-row items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(85,87,246,0.6)]">
              <Eye className="h-5.5 w-5.5" />
            </div>
            <div>
              <CardTitle className="text-brand-800">Entender composição do +5,61%</CardTitle>
              <CardDescription className="text-brand-700/70">
                Dril-down: ICPP geral → Categoria → Item → Histórico do preço e descrição daquele mês.
              </CardDescription>
            </div>
          </div>
          <Button size="default">
            Abrir drill-down <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden bg-white/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Categoria</th>
                  <th className="px-4 py-3 font-semibold text-right">Peso</th>
                  <th className="px-4 py-3 font-semibold text-right">Variação</th>
                  <th className="px-4 py-3 font-semibold text-right">Contribuição</th>
                  <th className="px-4 py-3 font-semibold text-left w-1/3">Participação no ICPP</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIAS.map((c, i) => {
                  const maxPct = 35;
                  return (
                    <tr key={c.cat} className={cn('border-t border-border hover:bg-white/80', i === 0 && 'border-t-0')}>
                      <td className="px-4 py-3 font-medium">{c.cat}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{fmtPct(c.peso)}</td>
                      <td className={'px-4 py-3 text-right tabular-nums font-medium ' + varClass(c.var, false)}>
                        {fmtPct(c.var)}
                      </td>
                      <td className={'px-4 py-3 text-right tabular-nums font-semibold ' + varClass(c.contr, false)}>
                        {fmtPP(c.contr)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex h-8 items-end gap-0.5">
                          {/* barra de contribuição */}
                          <div className="h-full w-[2px] bg-muted" />
                          <div className="h-2 bg-brand-200 rounded-full" style={{ width: Math.min(100, c.contr / 5.61 * 100) + '%' }} />
                          <div className="flex-1 h-2 rounded-full border border-brand-200/50" />
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">
                          {fmtPct(c.contr / 5.61 * 100)} do resultado
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/30 font-semibold">
                  <td className="px-4 py-3">TOTAL ICPP-SP</td>
                  <td className="px-4 py-3 text-right tabular-nums">100,00%</td>
                  <td className="px-4 py-3 text-right tabular-nums text-brand-600">{fmtPct(5.61)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-brand-600">{fmtPP(5.61)}</td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-5 h-[240px]">
            <ResponsiveContainer>
              <BarChart data={CATEGORIAS.slice(0, -1).map(c => ({ ...c, contr: c.contr }))} layout="vertical" margin={{ top: 5, right: 30, left: 200, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#e2e8f0"
                       tickFormatter={v => v.toFixed(2) + ' p.p.'} />
                <YAxis type="category" dataKey="cat" tick={{ fontSize: 11, fill: '#475569' }} stroke="#e2e8f0" width={190} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(v: number) => [v.toFixed(2) + ' p.p.', 'Contribuição']} />
                <Bar dataKey="contr" fill="#5557F6" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Separator />
      <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
        <p>
          <Badge variant="outline" className="font-normal mr-2">AUDITORIA</Badge>
          Resultado calculado com Metodologia ICPP-SP V1 · Motor v0.1.0 · hash_calculo pendente (definir após PV1–PV10).
        </p>
        <p>
          Nenhuma fórmula foi assumida. Regras de mês-base, pesos, itens novos/saídas, sem preço e outliers
          serão configuradas na entidade <code className="bg-muted px-1 rounded">icpp_methodologies.regras_*</code>
          após validação com o dono do processo.
        </p>
      </div>
    </div>
  );
}
