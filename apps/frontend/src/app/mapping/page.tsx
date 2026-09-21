import * as React from 'react';
import { Eye, Check, Search as SearchIcon, Sparkles, Plus, Clock, FileWarning, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { fmtBRL, fmtPct, varClass } from '@/lib/utils';

const NIVEIS_CONFIANCA = [
  { faixa: '95%–100%', label: 'Alta confiança', cor: 'bg-emerald-500/15 text-emerald-700', nota: 'Associação automática permitida' },
  { faixa: '75%–94%',  label: 'Revisão humana', cor: 'bg-amber-500/15 text-amber-700', nota: 'Ação obrigatória nesta tela' },
  { faixa: '< 75%',     label: 'Baixa confiança', cor: 'bg-rose-500/15 text-rose-700', nota: 'Provavelmente item novo' },
];

const LINHAS = [
  { id: 1,  desc: 'J02 JANELA 2F 150X121',             cod: 'J02', cat: 'MAT Esquadrias de Alumínio', un: 'unid', qtd: 145.8, pu: 726.88,
    sugestao: 'MAT-ESQ-0038', sugestaoNome: 'Janela de correr alumínio 2F 1,50 × 1,21', conf: 94, status: 'REVISAR', aliases: 5 },
  { id: 2,  desc: 'PORTA ALUM C/BANDEIRA 210X80',     cod: 'PA14', cat: 'MAT Esquadrias de Alumínio', un: 'unid', qtd: 82.0, pu: 1492.30,
    sugestao: 'MAT-ESQ-0012', sugestaoNome: 'Porta alumínio c/ bandeira 2,10 × 0,80', conf: 91, status: 'REVISAR', aliases: 3 },
  { id: 3,  desc: 'ARGAMASSA AC III EXTERNA 20KG',    cod: 'ARG-3', cat: 'MAT Argamassa',             un: 'sc',   qtd: 1240, pu: 32.19,
    sugestao: 'MAT-ARG-0007', sugestaoNome: 'Argamassa ACI III externa 20kg', conf: 89, status: 'REVISAR', aliases: 6 },
  { id: 4,  desc: 'CONCRETO FCK 30 USINADO SLUMP',    cod: 'CON-30', cat: 'MAT Concreto',              un: 'm³',   qtd: 520.0, pu: 512.30,
    sugestao: 'MAT-CON-0012', sugestaoNome: 'Concreto usinado Fck=30MPa', conf: 97, status: 'AUTO', aliases: 4 },
  { id: 5,  desc: 'BL. 14X19X29 BETON',               cod: 'BLO-14', cat: 'MAT Bloco de Concreto',     un: 'unid', qtd: 32140, pu: 4.12,
    sugestao: 'MAT-BLO-0001', sugestaoNome: 'Bloco concreto 14×19×29cm', conf: 99, status: 'AUTO', aliases: 3 },
  { id: 6,  desc: 'AÇO CA50 10,0mm BARRA',            cod: null, cat: 'MAT Aço',                     un: 'kg',   qtd: 18930, pu: 8.41,
    sugestao: null, sugestaoNome: null, conf: 62, status: 'NOVO', aliases: 0 },
  { id: 7,  desc: 'TELA SOLDADA 6,0mm MALHA 15X15',   cod: 'TEL-6', cat: 'MAT Tela Aço',             un: 'm²',   qtd: 2380, pu: 14.22,
    sugestao: 'MAT-TEL-0003', sugestaoNome: 'Tela soldada 6,0mm 15×15', conf: 82, status: 'REVISAR', aliases: 2 },
];

const badgeCor = (s: string) =>
  s === 'AUTO'     ? ({ variant: 'success', label: 'Reconhecido' } as const) :
  s === 'REVISAR'  ? ({ variant: 'warn',    label: 'Revisar'    } as const) :
                     ({ variant: 'default', label: 'Novo'       } as const);

export default function MappingPage() {
  const [filtro, setFiltro] = React.useState('TODOS');
  const total = LINHAS.length;
  const revisar = LINHAS.filter(l => l.status === 'REVISAR').length;
  const auto = LINHAS.filter(l => l.status === 'AUTO').length;
  const novos = LINHAS.filter(l => l.status === 'NOVO').length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Mapeamento de Itens</h1>
        <p className="mt-1 text-muted-foreground">
          Reconhecimento automático por alias + similaridade. Resolva os casos pendentes e o sistema aprende
          para os próximos meses.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { l: 'Total importado', v: total,        i: total, icon: Eye, cor: 'bg-brand-50 text-brand-600' },
          { l: 'Auto-reconhecidos', v: auto,        i: auto,  icon: Check, cor: 'bg-emerald-50 text-emerald-600' },
          { l: 'Para revisão',      v: revisar,     i: revisar,icon: FileWarning, cor: 'bg-amber-50 text-amber-600' },
          { l: 'Itens novos',       v: novos,       i: novos, icon: Plus, cor: 'bg-blue-50 text-blue-600' },
        ].map((k, i) => {
          const Icon = k.icon;
          return (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="cb-kpi-label">{k.l}</div>
                    <div className="cb-kpi-value mt-1">{k.v}</div>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-start md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-500" />
                Linhas da competência SET/26
              </CardTitle>
              <CardDescription>{total} linhas · clique em <strong>Revisar</strong> para lado a lado.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9 w-[260px]" placeholder="Buscar descrição, código..." />
              </div>
              {['TODOS', 'REVISAR', 'AUTO', 'NOVO'].map(f => (
                <Button key={f} variant={filtro === f ? 'default' : 'outline'} size="sm" onClick={() => setFiltro(f)}>
                  {f}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="-mt-1">
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Descrição recebida</th>
                    <th className="px-3 py-3 font-semibold">Sugestão</th>
                    <th className="px-3 py-3 font-semibold text-right">Confiança</th>
                    <th className="px-3 py-3 font-semibold text-right">Preço</th>
                    <th className="px-3 py-3 font-semibold text-center">Status</th>
                    <th className="px-3 py-3 font-semibold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {LINHAS
                    .filter(l => filtro === 'TODOS' || l.status === filtro)
                    .map(l => {
                      const b = badgeCor(l.status);
                      return (
                        <tr key={l.id} className="border-t border-border hover:bg-muted/30">
                          <td className="px-3 py-3">
                            <div className="font-medium leading-snug">{l.desc}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {l.cod || '—'} · {l.cat} · {l.un}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            {l.sugestao ? (
                              <div>
                                <div className="inline-flex items-center gap-1 text-[10px] font-mono bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded">
                                  {l.sugestao}
                                </div>
                                <div className="text-xs text-muted-foreground truncate max-w-[220px]">{l.sugestaoNome}</div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Sem sugestão</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className={'text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full ' + (
                                l.conf >= 95 ? 'bg-emerald-500/15 text-emerald-700' :
                                l.conf >= 75 ? 'bg-amber-500/15 text-amber-700' :
                                              'bg-rose-500/15 text-rose-700')
                              }>{l.conf}%</span>
                              <div className="h-1 w-20 rounded-full bg-muted overflow-hidden">
                                <div className="h-full bg-brand-500 rounded-full" style={{ width: l.conf + '%' }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums font-medium">{fmtBRL(l.pu)}</td>
                          <td className="px-3 py-3 text-center">
                            <Badge variant={b.variant}>{b.label}</Badge>
                          </td>
                          <td className="px-3 py-3 text-right">
                            {l.status === 'REVISAR' ? (
                              <Button size="sm">Revisar <ChevronRight className="h-4 w-4 ml-1" /></Button>
                            ) : l.status === 'AUTO' ? (
                              <Button variant="ghost" size="sm">Detalhes</Button>
                            ) : (
                              <Button variant="default" size="sm">Criar novo</Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Níveis de confiança</CardTitle>
              <CardDescription>Limites configuráveis em <em>Configurações</em>.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 -mt-1">
              {NIVEIS_CONFIANCA.map(n => (
                <div key={n.faixa} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{n.faixa}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${n.cor}`}>{n.label}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{n.nota}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-dashed bg-card/50">
            <CardContent className="p-5 space-y-3 text-sm">
              <div className="flex items-center gap-2 font-semibold">
                <Clock className="h-4 w-4 text-brand-500" />
                Curva de aprendizado
              </div>
              <Separator />
              <div className="space-y-2">
                {[
                  ['Agora (SET/26)', 853, 798, 55],
                  ['Em 3 meses',      860, 850, 10],
                  ['Em 6 meses',      870, 865, 5],
                ].map(([m, t, r, rev]) => (
                  <div key={m as string}>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>{m as string}</span>
                      <span className="font-medium text-foreground">
                        {Math.round((r as number) / (t as number) * 100)}% reconhecidos
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full"
                        style={{ width: Math.round((r as number) / (t as number) * 100) + '%' }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                Cada confirmação humana adiciona um alias e melhora o dicionário interno.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
