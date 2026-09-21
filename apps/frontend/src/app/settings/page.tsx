import * as React from 'react';
import {
  Settings, Users, Building2, ShieldCheck, Sliders, Braces, Database, Sparkles, Scale, HelpCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'geral',      label: 'Geral',              icon: Settings },
  { id: 'empresa',    label: 'Empresa',            icon: Building2 },
  { id: 'usuarios',   label: 'Usuários',           icon: Users },
  { id: 'seguranca',  label: 'Segurança',          icon: ShieldCheck },
  { id: 'matching',   label: 'Matching / IA',      icon: Sparkles },
  { id: 'metodologia',label: 'Metodologia ICPP',   icon: Scale },
  { id: 'auditoria',  label: 'Auditoria',          icon: Database },
  { id: 'api',        label: 'Integração / API',   icon: Braces },
  { id: 'ajuda',      label: 'Ajuda',              icon: HelpCircle },
];

export default function SettingsPage() {
  const [tab, setTab] = React.useState('metodologia');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="mt-1 text-muted-foreground">
          Customização por empresa. Alterações em parâmetros sensíveis (metodologia, limiares, permissões)
          são registradas na auditoria.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-1 p-2">
          <nav className="flex flex-col gap-1">
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-left',
                    active
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}>
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>
        </Card>

        <div className="lg:col-span-4 space-y-6">
          {tab === 'metodologia' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-brand-500" />
                    Metodologia ICPP-SP
                  </CardTitle>
                  <CardDescription>
                    Versões vigentes e placeholders para as regras de negócio PV1–PV10.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { v: 'V1', status: 'Vigente',   cor: 'success', de: 'AGO/25', até: '—', obs: 'Metodologia atual · 14 meses' },
                      { v: 'V2', status: 'Rascunho',  cor: 'warn',    de: 'JAN/27', até: '—', obs: 'Aguardando definições do novo orçamento base' },
                    ].map(mv => (
                      <div key={mv.v} className="rounded-xl border border-border p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold">{mv.v}</div>
                            <div>
                              <div className="font-semibold">ICPP-SP Metodologia {mv.v}</div>
                              <div className="text-xs text-muted-foreground">{mv.obs}</div>
                            </div>
                          </div>
                          <Badge variant={mv.cor === 'success' ? 'success' : 'warn'}>{mv.status}</Badge>
                        </div>
                        <Separator className="my-3" />
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div><span className="text-muted-foreground">Válida de:</span> <strong>{mv.de}</strong></div>
                          <div><span className="text-muted-foreground">Até:</span> <strong>{mv.até}</strong></div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button variant="outline" size="sm">Editar regras</Button>
                          <Button variant="ghost" size="sm">Clonar</Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Regras da metodologia · V1</h3>
                      <Badge variant="warn">PENDENTE · PV1–PV10</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {[
                        ['PV1 · Mês-base dos pesos', 'Não definido', 'Orçamento base ou mês específico'],
                        ['PV2 · Fonte do peso', 'Não definido', 'Preço total global ou Qtd × Pu'],
                        ['PV3 · Item sem preço no mês', 'Não definido', 'Mantém anterior / exclui / interpola'],
                        ['PV4 · Itens entrando / saindo', 'Não definido', 'Redistribui peso / Δ=0'],
                        ['PV5 · Preço considerado', 'Não definido', 'Unitário ou Total Global'],
                        ['PV6 · Mês-base Nº Índice = 100', 'Não definido', 'Primeiro mês da série ou outra data'],
                        ['PV7 · Coluna "NÃO UTILIZAR"', 'Não definido', 'Excluído da soma ou do peso'],
                        ['PV8 · Var. acumulada item × custo total', 'Não definido', 'Diferença entre colunas F e G'],
                        ['PV9 · Macrocategorias (MO ALV + ESTRUTURAL)', 'Não definido', 'Soma fixa ou calculada'],
                        ['PV10 · Revisões anuais de pesos', 'Não definido', 'Congelados ou nova versão metodologia'],
                      ].map(([label, valor, hint], i) => (
                        <div key={i} className="rounded-lg border border-dashed border-border p-3 bg-card/50">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{label}</span>
                            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                              {valor}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                      Cada regra acima será convertida em campos JSONB em
                      <code className="mx-1 bg-muted px-1 rounded">icpp_methodologies.regras_*</code>
                      e implementada no motor de cálculo <strong>somente após validação do dono do processo</strong>.
                      Nenhuma fórmula é assumida por padrão.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4 text-brand-500" />
                    Limiares de confiança (matching)
                  </CardTitle>
                  <CardDescription>Valores padrão, ajustáveis por empresa.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { faixa: '95%–100%', tipo: 'Alta confiança',   acao: 'Associação automática permitida', valor: 95, cor: 'bg-emerald-500' },
                    { faixa: '75%–94%',  tipo: 'Revisão humana',    acao: 'Sempre pedir confirmação',         valor: 75, cor: 'bg-amber-500' },
                    { faixa: '< 75%',     tipo: 'Baixa confiança',  acao: 'Tratar como item novo',              valor: 0,  cor: 'bg-rose-500' },
                  ].map((l, i) => (
                    <div key={i} className="rounded-lg border border-border p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{l.faixa}</span>
                        <span className="text-xs text-muted-foreground">{l.tipo}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className={cn('h-full rounded-full', l.cor)} style={{ width: l.valor + '%' }} />
                      </div>
                      <div className="text-xs text-muted-foreground">{l.acao}</div>
                      <div className="pt-2">
                        <Label className="text-[11px]">Limiar mínimo (%)</Label>
                        <Input className="mt-1 h-8" defaultValue={l.valor + '%'} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {tab !== 'metodologia' && (
            <Card className="border-dashed bg-card/50">
              <CardContent className="p-10 text-center text-sm">
                <Settings className="h-10 w-10 text-brand-400 mx-auto mb-3" />
                <div className="font-semibold">Aba <em>{TABS.find(t => t.id === tab)?.label}</em></div>
                <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                  Estrutura criada na Sprint 0. Configurações detalhadas serão implementadas conforme
                  as próximas sprints evoluírem (Usuários, Segurança, Auditoria, Integração API).
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
