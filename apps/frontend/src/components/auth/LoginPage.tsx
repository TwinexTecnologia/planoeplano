'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Loader2,
  Lock,
  Mail,
  Building2,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/providers/AuthProvider';
import { AppLogo } from '@/components/layout/AppLogo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const fd = new FormData(e.currentTarget);
      await login(String(fd.get('email')), String(fd.get('senha')));
    } catch (err: any) {
      setMsg(err?.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-brand-900 via-brand-950 to-[#0a0a1f] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Lado esquerdo — pitch institucional */}
        <div className="hidden lg:flex flex-col gap-6 text-white/90">
          <AppLogo size="lg" />
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            A fonte histórica confiável
            <br />
            dos custos da sua construtora.
          </h1>
          <p className="text-white/70 max-w-lg leading-relaxed">
            Preserve a identidade dos mesmos materiais e serviços ao longo do tempo,
            calcule o ICPP-SP com rastreabilidade total e compare com INCC, ICC-SP e IPCA.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 text-sm">
            {[
              ['Identidade permanente', 'Item Canônico + Aliases históricos'],
              ['Metodologia versionada', 'Resultados do passado NUNCA mudam'],
              ['Motor de matching inteligente', '95% de reconhecimento automático em 6 meses'],
              ['Drill-down completo', 'ICPP → Categoria → Item → Histórico'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
                <div className="font-semibold text-white">{t}</div>
                <div className="text-white/60 mt-1 text-[13px]">{d}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-white/40 pt-2">
            © {new Date().getFullYear()} CostBase · Todos os direitos reservados.
          </div>
        </div>

        {/* Lado direito — card de login */}
        <div>
          <Card className="text-foreground border-0 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Acesse sua conta</CardTitle>
              <CardDescription>
                Utilize suas credenciais do CostBase ou crie uma conta trial.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="w-full grid grid-cols-2 mb-6">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="register">Criar conta</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-login">E-mail</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email-login" name="email" type="email" autoComplete="email"
                               placeholder="voce@construtora.com.br"
                               className="pl-9" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="senha-login">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="senha-login" name="senha" type="password" autoComplete="current-password"
                               placeholder="••••••••"
                               className="pl-9" required />
                      </div>
                    </div>
                    {msg && (
                      <div className="rounded-md bg-status-down/10 text-status-down text-sm p-3">
                        {msg}
                      </div>
                    )}
                    <Button type="submit" className="w-full h-11" disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Entrar no CostBase
                    </Button>
                  </form>

                  <Separator className="my-6" />

                  <div className="text-center">
                    <div className="cb-kpi-label mb-2">Ambiente de desenvolvimento</div>
                    <Button variant="outline" size="sm"
                      onClick={() => login('alex@planoaplano.com.br', 'demo1234')}
                      disabled={loading}>
                      Entrar como demo · Plano&amp;Plano
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={async e => {
                    e.preventDefault();
                    setMsg('Registro via backend disponível após inicialização do Nest.');
                  }} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Empresa</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder="Minha Construtora Ltda" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Seu nome</Label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="João Silva" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>E-mail</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" type="email" required />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="password" className="pl-9" placeholder="Mínimo 8 caracteres" required />
                      </div>
                    </div>
                    <Button className="w-full h-11">
                      Criar conta trial · 14 dias grátis
                    </Button>
                    <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
                      Ao criar a conta você concorda com os termos de uso.
                      Seus dados ficam isolados em um schema multiempresa.
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
