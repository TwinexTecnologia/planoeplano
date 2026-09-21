import * as React from 'react';
import Link from 'next/link';
import { ShoppingBasket, TrendingUp, TrendingDown, Equal, ChevronRight, Download, FileJson, Settings2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { fmtPct, fmtPP, fmtBRL, varClass } from '@/lib/utils';

const CATEGORIAS = [
  { cat: 'EMP Instalações',             peso: 18.63, precoA: 10093302.0, precoB: 10639052.04, var: 6.00, contr: 1.12 },
  { cat: 'MO ALV + ESTRUTURAL',        peso: 10.72, precoA: 6116132.35, precoB: 6158438.55, var: 6.00, contr: 0.64 },
  { cat: 'MAT Bloco de Concreto',       peso: 7.65, precoA: 4394058.42, precoB: 4394058.42, var: 8.14, contr: 0.62 },
  { cat: 'MO ALVENARIA',                peso: 6.67, precoA: 3619226.26, precoB: 3833752.86, var: 5.99, contr: 0.40 },
  { cat: 'Elevadores',                  peso: 4.37, precoA: 2286385.04, precoB: 2510612.90, var: 9.78, contr: 0.43 },
  { cat: 'MAT Concreto',                peso: 3.90, precoA: 2240117.74, precoB: 2240117.74, var: 5.45, contr: 0.21 },
  { cat: 'MAT Aço',                     peso: 2.95, precoA: 1528757.00, precoB: 1636315.33, var: 4.15, contr: 0.12 },
  { cat: 'INSTALAÇÕES + barr. + cabos', peso: 8.37, precoA: 407063.21, precoB: 407063.21, var: 6.00, contr: 0.50 },
  { cat: 'MAT Esquadrias de Alumínio',  peso: 2.10, precoA: 1206786.40, precoB: 974450.64, var: 2.42, contr: 0.05 },
  { cat: 'MAT Argamassa',               peso: 1.47, precoA: 846465.21, precoB: 846465.21, var: 7.77, contr: 0.11 },
  { cat: 'Demais categorias (32)',      peso: 33.17, precoA: 0, precoB: 0, var: 4.1, contr: 1.41 },
];

export default function BasketPage() {
  const totalPeso = CATEGORIAS.reduce((s, c) => s + c.peso, 0);
  const totalContr = CATEGORIAS.reduce((s, c) => s + c.contr, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">Metodologia V1</Badge>
            <span>·</span>
            <span>Vigente desde AGO/25</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mt-1">Cesta Básica · SET/26</h1>
          <p className="mt-1 text-muted-foreground">
            Composição por categoria, pesos e contribuição de cada item para o ICPP-SP do mês.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> XLSX</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> CSV</Button>
          <Link href="/settings/methodology" passHref className="inline-flex">
            <Button variant="outline" size="sm"><Settings2 className="h-4 w-4 mr-2" /> Metodologia</Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { l: 'Itens na Cesta', v: '853', s: 'Mesmos 853 de SET/26', icon: ShoppingBasket, cor: 'text-brand-600 bg-brand-50' },
          { l: 'Peso coberto', v: '100,00%', s: `${CATEGORIAS.length - 1} categorias`, icon: Equal, cor: 'text-emerald-600 bg-emerald-50' },
          { l: 'Contribuição somada', v: '+5,61 p.p.', s: 'ICPP SET/26', icon: TrendingUp, cor: 'text-brand-600 bg-brand-50' },
        ].map((k, i) => {
          const Icon = k.icon;
          return (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="cb-kpi-label">{k.l}</div>
                    <div className="cb-kpi-value mt-1">{k.v}</div>
                    <div className="text-xs text-muted-foreground mt-1">{k.s}</div>
                  </div>
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${k.cor}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>Composição por Categoria</CardTitle>
            <CardDescription>
              Peso × Variação = Contribuição em pontos percentuais (p.p.).
              Dril-down clicando na categoria.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Categoria</th>
                  <th className="px-4 py-3 font-semibold text-right">Peso</th>
                  <th className="px-4 py-3 font-semibold text-right">Preço total AGO/26</th>
                  <th className="px-4 py-3 font-semibold text-right">Preço total SET/26</th>
                  <th className="px-4 py-3 font-semibold text-right">Variação</th>
                  <th className="px-4 py-3 font-semibold text-right">Contribuição</th>
                  <th className="px-4 py-3 font-semibold text-left w-60">Impacto</th>
                  <th className="px-4 py-3 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIAS.map((c, i) => {
                  const maxContr = 1.5;
                  const pct = Math.min(100, Math.abs(c.contr) / maxContr * 100);
                  return (
                    <tr key={c.cat} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{c.cat}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{fmtPct(c.peso)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{c.precoA ? fmtBRL(c.precoA) : '—'}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">{c.precoB ? fmtBRL(c.precoB) : '—'}</td>
                      <td className={'px-4 py-3 text-right tabular-nums font-semibold ' + varClass(c.var, false)}>
                        {fmtPct(c.var)}
                      </td>
                      <td className={'px-4 py-3 text-right tabular-nums font-semibold ' + varClass(c.contr, false)}>
                        {fmtPP(c.contr)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className={'h-full rounded-full ' + (c.contr >= 0 ? 'bg-status-down/75' : 'bg-status-up/75')}
                               style={{ width: pct + '%' }} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm">
                          Itens <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/30 font-semibold">
                  <td className="px-4 py-3" colSpan={2}>TOTAL</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtPct(totalPeso)}</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right tabular-nums text-brand-600">{fmtPct(5.61)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-brand-600">{fmtPP(totalContr)}</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-dashed bg-card/50">
          <CardContent className="p-5 space-y-3 text-sm">
            <div className="font-semibold flex items-center gap-2">
              <FileJson className="h-4 w-4 text-brand-500" />
              Configuração de pesos (placeholders)
            </div>
            <Separator />
            <p className="text-muted-foreground leading-relaxed">
              A fonte dos pesos (<strong>mês-base / orçamento</strong>) e a regra de tratamento para
              itens novos / excluídos / sem preço estão marcadas como PV1–PV10 e serão configuradas
              na metodologia após validação do dono do processo. Nenhum valor é assumido aqui.
            </p>
          </CardContent>
        </Card>
        <Card className="border-dashed bg-card/50">
          <CardContent className="p-5 space-y-3 text-sm">
            <div className="font-semibold flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-brand-500" />
              Curva ABC · Arquitetura preparada
            </div>
            <Separator />
            <p className="text-muted-foreground leading-relaxed">
              Estrutura de dados suporta Curva ABC de categorias e de materiais (ranking de maior
              impacto financeiro e maior contribuição para o ICPP). Implementação após validação do
              motor de cálculo.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

