import * as React from 'react';
import Link from 'next/link';
import { PackageSearch, ChevronRight, Plus, TrendingUpDown, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { fmtBRL, fmtPct, varClass } from '@/lib/utils';

const CATEGORIAS = [
  { nome: 'MAT Bloco de Concreto',     itens: 34, peso: 7.65,  var: 8.14 },
  { nome: 'MAT Concreto',              itens: 42, peso: 3.90,  var: 5.45 },
  { nome: 'MAT Aço',                   itens: 87, peso: 2.95,  var: 4.15 },
  { nome: 'MAT Esquadrias de Alumínio',itens: 61, peso: 2.10,  var: 2.42 },
  { nome: 'EMP Instalações',           itens: 198,peso: 18.63, var: 6.00 },
  { nome: 'MO Alvenaria',              itens: 49, peso: 6.67,  var: 5.99 },
  { nome: 'Elevadores',                itens: 23, peso: 4.37,  var: 9.78 },
];

const ITENS_EXEMPLO = [
  { id: 'MAT-ESQ-0038', cat: 'MAT Esquadrias de Alumínio', nome: 'Janela de correr alumínio 2F 1,50 × 1,21',
    un: 'unid', aliases: 7, precoAtual: 726.88, precoAnterior: 704.01, pct: 3.25, meses: 12 },
  { id: 'MAT-CON-0012', cat: 'MAT Concreto',                nome: 'Concreto usinado fck=30MPa',
    un: 'm³',   aliases: 4, precoAtual: 512.30, precoAnterior: 498.11, pct: 2.85, meses: 18 },
  { id: 'MAT-ACO-0004', cat: 'MAT Aço',                     nome: 'Aço CA-50 10,0mm',
    un: 'kg',   aliases: 5, precoAtual: 8.41,   precoAnterior: 8.07,   pct: 4.21, meses: 24 },
  { id: 'EMP-INS-0121', cat: 'EMP Instalações',             nome: 'Instalação hidráulica completa tipo A',
    un: 'unid', aliases: 9, precoAtual: 18430.50, precoAnterior: 17349.99, pct: 6.23, meses: 11 },
  { id: 'MAT-BLO-0001', cat: 'MAT Bloco de Concreto',       nome: 'Bloco de concreto 14x19x29cm',
    un: 'unid', aliases: 3, precoAtual: 4.12,   precoAnterior: 3.81,   pct: 8.14, meses: 36 },
];

export default function ItemsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Itens e Histórico</h1>
          <p className="mt-1 text-muted-foreground">
            Itens Canônicos com identidade permanente. Cada item agrupa seus aliases históricos e preços mês a mês.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar por ID, descrição, categoria, alias..." />
          </div>
          <Button variant="outline">Filtros</Button>
          <Button><Plus className="h-4 w-4 mr-2" /> Novo Item Canônico</Button>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-4">
        {[
          { l: 'Itens canônicos', v: '1.247' },
          { l: 'Aliases conhecidos', v: '4.893' },
          { l: 'Categorias ativas', v: CATEGORIAS.length.toString() },
          { l: 'Meses de histórico', v: '36' },
        ].map(k => (
          <Card key={k.l}>
            <CardContent className="p-5">
              <div className="cb-kpi-label">{k.l}</div>
              <div className="cb-kpi-value mt-1">{k.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por categoria</CardTitle>
            <CardDescription>Explore a hierarquia Categoria → Família → Item</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 -mt-1">
            {CATEGORIAS.map(c => (
              <button key={c.nome}
                      className="w-full flex items-center justify-between text-left p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{c.nome}</div>
                  <div className="text-[11px] text-muted-foreground">{c.itens} itens · Peso {fmtPct(c.peso)}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={'text-xs tabular-nums font-semibold ' + varClass(c.var, false)}>
                    {fmtPct(c.var)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <PackageSearch className="h-4 w-4 text-brand-500" /> Itens Canônicos
              </CardTitle>
              <CardDescription>Exibindo 5 de 1.247 itens</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="-mt-1">
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">ID · Item</th>
                    <th className="px-4 py-3 font-semibold">Un.</th>
                    <th className="px-4 py-3 font-semibold text-right">Preço atual</th>
                    <th className="px-4 py-3 font-semibold text-right">M/M</th>
                    <th className="px-4 py-3 font-semibold text-right">Aliases</th>
                    <th className="px-4 py-3 font-semibold text-right">Hist.</th>
                  </tr>
                </thead>
                <tbody>
                  {ITENS_EXEMPLO.map(it => (
                    <tr key={it.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link href={`/items/${it.id}`} className="block">
                          <div className="inline-flex items-center gap-1.5 mb-0.5">
                            <Badge variant="outline" className="text-[10px] font-mono">{it.id}</Badge>
                          </div>
                          <div className="font-medium leading-snug">{it.nome}</div>
                          <div className="text-[11px] text-muted-foreground">{it.cat}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{it.un}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">{fmtBRL(it.precoAtual)}</td>
                      <td className={'px-4 py-3 text-right tabular-nums font-semibold ' + varClass(it.pct, false)}>
                        {fmtPct(it.pct)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{it.aliases}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{it.meses}m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Ordenado por maior peso na cesta</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm">Anterior</Button>
                <Button variant="outline" size="sm">1</Button>
                <Button variant="ghost" size="sm">Próxima</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed border-border bg-card/50">
        <CardContent className="p-5 text-sm flex items-start gap-4">
          <TrendingUpDown className="h-6 w-6 text-brand-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Página individual de cada item canônico</div>
            <p className="text-muted-foreground mt-1 leading-relaxed">
              Clique em qualquer item para visualizar: preço atual/anterior, variação mensal/acumulada,
              menor/maior preço histórico, média, gráfico de evolução e o histórico de descrições mês a mês
              (ex: ABR/26 → J02 Janela Correr; MAI/26 → Janela Correr 2F).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
