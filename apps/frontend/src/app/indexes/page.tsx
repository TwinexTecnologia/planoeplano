import * as React from 'react';
import { LineChart, Plus, Upload, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { fmtPct, varClass, cn } from '@/lib/utils';

const INDICES = [
  { sigla: 'ICPP-SP', nome: 'Índice Próprio de Custo da Construção', instituicao: 'Interno · Plano&Plano',
    tipo: 'CALCULADO',  ativo: true, meses: 36, ultimo: { m: 'set/26', v: 5.61, mensal: -0.01, a24: 12.31 } },
  { sigla: 'INCC',     nome: 'Índice Nacional da Construção Civil', instituicao: 'FGV',
    tipo: 'EXTERNO',    ativo: true, meses: 36, ultimo: { m: 'set/26', v: 6.59, mensal:  0.19, a24: 13.82 } },
  { sigla: 'ICC-SP',   nome: 'Índice da Construção Civil · São Paulo', instituicao: 'FGV · Padrão Econômico',
    tipo: 'EXTERNO',   ativo: true, meses: 36, ultimo: { m: 'set/26', v: 7.35, mensal:  0.15, a24: 14.90 } },
  { sigla: 'IPCA',     nome: 'Índice Nacional de Preços ao Consumidor Amplo', instituicao: 'IBGE',
    tipo: 'EXTERNO',   ativo: true, meses: 36, ultimo: { m: 'set/26', v: 4.22, mensal: -0.32, a24: 9.15 } },
];

export default function IndexesPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Índices</h1>
          <p className="mt-1 text-muted-foreground">
            Cadastro dos índices internos e externos utilizados na comparação.
            INCC, ICC-SP e IPCA são importados mensalmente; ICPP-SP é calculado pelo CostBase.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline"><Upload className="h-4 w-4 mr-2" /> Importar valores do mês</Button>
          <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Exportar série</Button>
          <Button><Plus className="h-4 w-4 mr-2" /> Novo índice</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LineChart className="h-4 w-4 text-brand-500" /> Índices ativos
            </CardTitle>
            <CardDescription>Clique em um índice para ver a série completa.</CardDescription>
          </CardHeader>
          <CardContent className="-mt-1">
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Índice</th>
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold">Instituição</th>
                    <th className="px-4 py-3 font-semibold text-right">Últ. mês</th>
                    <th className="px-4 py-3 font-semibold text-right">12 meses</th>
                    <th className="px-4 py-3 font-semibold text-right">M/M</th>
                    <th className="px-4 py-3 font-semibold text-right">24 meses</th>
                    <th className="px-4 py-3 font-semibold text-center">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {INDICES.map(ix => (
                    <tr key={ix.sigla} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-semibold">{ix.sigla}</div>
                        <div className="text-[11px] text-muted-foreground">{ix.nome}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={ix.tipo === 'CALCULADO' ? 'default' : 'outline'}>{ix.tipo}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{ix.instituicao}</td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground">{ix.ultimo.m}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">
                        {fmtPct(ix.ultimo.v)}
                      </td>
                      <td className={'px-4 py-3 text-right tabular-nums text-xs font-medium ' + varClass(ix.ultimo.mensal, true)}>
                        {fmtPct(ix.ultimo.mensal)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {fmtPct(ix.ultimo.a24)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={ix.ativo ? 'success' : 'secondary'}>
                          {ix.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cadastrar valores do mês</CardTitle>
              <CardDescription>SET/26 · Dados externos lançados manualmente ou via CSV.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['INCC', 'ICC-SP', 'IPCA'].map(sigla => (
                <div key={sigla}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-sm font-medium">{sigla}</div>
                    <div className="text-[11px] text-muted-foreground">SET/26</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Nº Índice</label>
                      <Input defaultValue="1.00" className="mt-0.5 h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">M/M</label>
                      <Input defaultValue="0,00%" className="mt-0.5 h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">12m</label>
                      <Input defaultValue="0,00%" className="mt-0.5 h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">24m</label>
                      <Input defaultValue="0,00%" className="mt-0.5 h-8 text-xs" />
                    </div>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">Importar CSV</Button>
                <Button size="sm" className="flex-1">Salvar mês</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed bg-card/50">
            <CardContent className="p-5 text-sm space-y-2">
              <div className="font-semibold">Sobre o ICPP-SP</div>
              <Separator />
              <p className="text-muted-foreground leading-relaxed">
                O ICPP-SP <strong>não</strong> é digitado nesta tela. Ele é calculado automaticamente pelo
                CostBase a partir da metodologia versionada, dos pesos da Cesta Básica e dos preços
                consolidados dos Itens Canônicos.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                O valor calculado é <strong>congelado</strong> no fechamento da competência
                (campos <em>hash_calculo</em> + <em>versao_motor</em>) para garantir reprodução futura.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
