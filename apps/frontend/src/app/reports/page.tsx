import * as React from 'react';
import { FileSpreadsheet, FileText, FileJson, ChartBar, Download, ChevronRight, FileX2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const RELATORIOS = [
  { icon: FileSpreadsheet, titulo: 'Cesta Básica · SET/26',   desc: 'Composição completa por categoria + peso + variação + contribuição.', formato: ['XLSX','CSV','PDF'], tamanho: '184 KB' },
  { icon: ChartBar,        titulo: 'ICPP-SP · Histórico',     desc: 'Índice, variação mensal, acumulados 12m/24m e comparação com INCC/ICC-SP/IPCA.', formato: ['XLSX','CSV'], tamanho: '42 KB' },
  { icon: FileSpreadsheet, titulo: 'Itens Canônicos',         desc: 'Lista completa: ID, nome oficial, categoria, família, unidade, aliases.', formato: ['XLSX','CSV'], tamanho: '112 KB' },
  { icon: FileJson,        titulo: 'Histórico de preços',     desc: 'Todas as competências por item canônico (formato long / tidy).', formato: ['CSV','JSON'], tamanho: '3,2 MB' },
  { icon: FileSpreadsheet, titulo: 'Categorias · Drill-down', desc: 'Resultado por categoria + detalhamento dos itens.', formato: ['XLSX'], tamanho: '156 KB' },
  { icon: FileX2,          titulo: 'Mapeamento pendente',     desc: '55 itens de SET/26 aguardando revisão humana.', formato: ['XLSX','CSV'], tamanho: '18 KB' },
  { icon: FileText,        titulo: 'Auditoria · SET/26',      desc: 'Log de ações do usuário na competência: mapeamentos, reaberturas, edições.', formato: ['CSV','PDF'], tamanho: '24 KB' },
  { icon: FileJson,        titulo: 'Índices · Série histórica', desc: 'Todos os valores de ICPP, INCC, ICC-SP, IPCA desde nov/23.', formato: ['CSV','JSON'], tamanho: '12 KB' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
          <p className="mt-1 text-muted-foreground">
            Extrações em XLSX / CSV / JSON do banco estruturado do CostBase. Integração Power BI via API
            disponível em <code className="bg-muted px-1 rounded">/api/items</code>, <code className="bg-muted px-1 rounded">/api/icpp</code>, etc.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><FileJson className="h-4 w-4 mr-2" /> Documentação API</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: 'Relatórios disponíveis', v: RELATORIOS.length.toString(), cor: 'bg-brand-50 text-brand-600' },
          { l: 'Formatos aceitos', v: 'XLSX · CSV · JSON · PDF', cor: 'bg-emerald-50 text-emerald-600' },
          { l: 'Dados disponíveis', v: '36 meses', cor: 'bg-blue-50 text-blue-600' },
          { l: 'Futuro', v: 'Power BI + API', cor: 'bg-amber-50 text-amber-600' },
        ].map((k, i) => {
          const Icon = i === 0 ? FileSpreadsheet : i === 1 ? Download : i === 2 ? ChartBar : FileJson;
          return (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="cb-kpi-label">{k.l}</div>
                    <div className="cb-kpi-value mt-1 text-base">{k.v}</div>
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
        <CardHeader>
          <CardTitle className="text-base">Catálogo de relatórios</CardTitle>
          <CardDescription>Ordenados por maior frequência de uso.</CardDescription>
        </CardHeader>
        <CardContent className="-mt-1">
          <div className="space-y-1">
            {RELATORIOS.map((r, i) => {
              const Icon = r.icon;
              return (
                <div key={i} className={
                  'flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg ' +
                  (i !== RELATORIOS.length - 1 ? 'hover:bg-muted/30 border-b border-border/60' : 'hover:bg-muted/30')
                }>
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{r.titulo}</div>
                    <div className="text-sm text-muted-foreground">{r.desc}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.formato.map(f => (
                      <Badge key={f} variant="outline" className="font-mono text-[10px]">{f}</Badge>
                    ))}
                    <span className="text-[11px] text-muted-foreground w-16 text-right">{r.tamanho}</span>
                    <Separator orientation="vertical" className="h-6" />
                    <Button variant="ghost" size="sm">
                      Baixar <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
