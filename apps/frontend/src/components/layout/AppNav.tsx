'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  PackageSearch,
  ScanLine,
  ShoppingBasket,
  TrendingUp,
  LineChart,
  FileBarChart,
  Settings,
  Search,
  ChevronDown,
  Bell,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AppLogo } from './AppLogo';
import { Input } from '../ui/input';

const MENU_PRINCIPAL = [
  { href: '/',             label: 'Início',                 icon: LayoutDashboard },
  { href: '/periods',      label: 'Competências',          icon: CalendarDays },
  { href: '/periods/new',  label: 'Cadastrar mês',         icon: PlusCircle },
  { href: '/items',        label: 'Itens e Histórico',     icon: PackageSearch },
  { href: '/mapping',      label: 'Mapeamento de Itens',   icon: ScanLine },
  { href: '/basket',       label: 'Cesta Básica',          icon: ShoppingBasket },
  { href: '/icpp',         label: 'ICPP-SP',               icon: TrendingUp },
  { href: '/indexes',      label: 'Índices',               icon: LineChart },
  { href: '/reports',      label: 'Relatórios',            icon: FileBarChart },
  { href: '/settings',     label: 'Configurações',         icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="h-16 px-5 flex items-center border-b border-sidebar-border">
        <AppLogo size="sm" />
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto cb-scrollbar-thin">
        {MENU_PRINCIPAL.map(item => {
          const Icon = item.icon;
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] shadow-sm'
                  : 'text-sidebar-foreground/80 hover:bg-white/5 hover:text-sidebar-foreground',
              )}
            >
              <Icon className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-white' : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground')} />
              <span>{item.label}</span>
              {item.href === '/mapping' && (
                <Badge variant="warn" className="ml-auto text-[10px] px-1.5">55</Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="rounded-lg bg-white/5 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Metodologia ativa
          </p>
          <p className="mt-1 text-sm font-semibold">ICPP-SP V1</p>
          <p className="text-[11px] text-sidebar-foreground/50 mt-0.5">
            Vigente desde AGO/25
          </p>
        </div>
      </div>
    </aside>
  );
}

export function AppTopBar() {
  const { user, logout } = useAuth();
  const inicial = user?.nome?.[0] || 'U';

  return (
    <header className="h-16 shrink-0 border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-20">
      <div className="h-full px-6 flex items-center gap-4">
        <div className="relative max-w-xl w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 bg-background/50"
            placeholder="Buscar item, descrição, código ou categoria..."
            type="search"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge variant="secondary" className="hidden sm:inline-flex">
            SET/26 · Em revisão
          </Badge>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-brand-500" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-1 pr-3 h-9">
                <Avatar className="h-7 w-7 bg-brand-500 text-white">
                  <AvatarFallback>{inicial}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-sm font-medium">{user?.nome || 'Convidado'}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {user?.company_nome || 'Plano&Plano'} · {user?.role || 'VISUALIZADOR'}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" /> Preferências
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileBarChart className="h-4 w-4 mr-2" /> Auditoria
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-status-down focus:text-status-down">
                <LogOut className="h-4 w-4 mr-2" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
