import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft, Calendar, FileUp, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function NewPeriodPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <Link href="/periods" className="text-sm text-muted-foreground inline-flex items-center hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" /> Voltar para competências
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">Cadastrar nova competência</h1>
        <p className="mt-1 text-muted-foreground">
          Siga os 4 passos abaixo. Nada é gravado antes da confirmação final.
        </p>
      </header>

      <ol className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
        {[
          { t: '1. Período',       s: true,  d: 'Mês de referência' },
          { t: '2. Importação',    s: false, d: 'XLSX / CSV' },
          { t: '3. Mapeamento',    s: false, d: 'Colunas do Excel' },
          { t: '4. Confirmação',   s: false, d: 'Criar competência' },
        ].map((p, i) => (
          <li key={p.t} className={
            'rounded-xl border p-4 flex items-center gap-3 ' +
            (p.s ? 'border-brand-200 bg-brand-50/60' : 'border-border bg-card')
          }>
            <div className={'h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ' +
              (p.s ? 'bg-brand-500 text-white' : 'bg-muted text-muted-foreground')}>{i + 1}</div>
            <div>
              <div className={'font-semibold ' + (p.s ? 'text-brand-700' : '')}>{p.t}</div>
              <div className="text-xs text-muted-foreground">{p.d}</div>
            </div>
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-brand-500" /> Passo 1 · Definir período</CardTitle>
            <CardDescription>Esta competência ficará visível apenas para sua empresa.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="mes">Mês de referência</Label>
              <Input id="mes" type="month" defaultValue="2026-10" />
              <p className="text-[11px] text-muted-foreground">Ex: outubro de 2026 → OUT/26</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metodologia">Metodologia ICPP aplicada</Label>
              <select id="metodologia" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option>ICPP-SP V1 · vigente desde AGO/25 (recomendado)</option>
                <option disabled>ICPP-SP V2 · em validação</option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                A metodologia versionada isola os cálculos e preserva resultados históricos.
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="obs">Observação interna (opcional)</Label>
              <textarea id="obs" rows={2} placeholder="Ajustes específicos deste mês..."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="ghost">Cancelar</Button>
            <Button>Avançar para importação <ArrowRight className="h-4 w-4 ml-2" /></Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><FileUp className="h-4 w-4 text-brand-500" /> Formatos aceitos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-[10px]">.XLSX</Badge>
                  <span>Excel (Office 365 / LibreOffice)</span>
                </div>
                <span className="text-muted-foreground text-xs">Recomendado</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">.CSV</Badge>
                  <span>UTF-8 · ponto e vírgula</span>
                </div>
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground leading-relaxed">
                O CostBase <span className="font-medium text-foreground">não exige nomes fixos</span> de colunas.
                No próximo passo você mapeia: Código · Descrição · Categoria · Unidade · Qtd. · Preço · Peso · etc.
              </div>
            </CardContent>
          </Card>

          <Card className="border-brand-200/70 bg-brand-50/50">
            <CardContent className="p-5 text-sm text-brand-900/90 space-y-2">
              <div className="font-semibold">Antes de importar</div>
              <ul className="list-disc list-inside space-y-1 text-xs text-brand-800/80">
                <li>Um mesmo arquivo não é importado duas vezes (verificação por SHA-256)</li>
                <li>Os valores originais do Excel são preservados célula-a-célula (camada Raw)</li>
                <li>Nenhum dado é substituído ou apagado durante o matching</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
