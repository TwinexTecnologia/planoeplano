import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata moeda BRL (R$ 1.234,56).
 */
export function fmtBRL(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return '—';
  const n = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(n);
}

/**
 * Formata percentual (ex: 5.61 → "5,61%").
 * Recebe valor em porcentagem (0 a 100), não 0 a 1.
 */
export function fmtPct(value: number | string | null | undefined, decimals = 2) {
  if (value === null || value === undefined || value === '') return '—';
  const n = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(n)) return '—';
  const signo = n > 0 ? '+' : '';
  return signo + n.toFixed(decimals).replace('.', ',') + '%';
}

/**
 * Formata pontos percentuais (ex: -0.98 → "−0,98 p.p.").
 */
export function fmtPP(value: number | string | null | undefined, decimals = 2) {
  if (value === null || value === undefined || value === '') return '—';
  const n = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(n)) return '—';
  const sinal = n > 0 ? '+' : n < 0 ? '−' : '';
  return sinal + Math.abs(n).toFixed(decimals).replace('.', ',') + ' p.p.';
}

/**
 * Converte competência "202609" → "SET/26".
 */
export function fmtCompetencia(comp: string) {
  if (!/^\d{6}$/.test(comp)) return comp;
  const ano = comp.slice(2, 4);
  const mesIdx = parseInt(comp.slice(4, 6), 10) - 1;
  const meses = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
  return meses[mesIdx] + '/' + ano;
}

/**
 * Classe CSS positiva/negativa para variações.
 * Por padrão, "subiu" = vermelho para custos (é ruim para a construtora).
 * Passar `invert=true` quando "subiu" for bom.
 */
export function varClass(value: number, invert = false) {
  const pos = invert ? 'cb-variacao-pos' : 'cb-variacao-neg';
  const neg = invert ? 'cb-variacao-neg' : 'cb-variacao-pos';
  if (value > 0) return pos;
  if (value < 0) return neg;
  return 'text-muted-foreground';
}

/** Formata data ISO para pt-BR. Ex: "2026-09-01" → "01/09/2026". */
export function fmtDataBR(value: string | Date | null | undefined) {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

/** Formata data e hora pt-BR. */
export function fmtDataHoraBR(value: string | Date | null | undefined) {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR', { hour12: false });
}

/** Formata nome abreviado de usuário. */
export function fmtUsuario(user: { nome?: string | null; email?: string | null } | null | undefined) {
  if (!user) return '—';
  if (user.nome) {
    const p = user.nome.split(' ');
    return p.length > 1 ? `${p[0]} ${p[p.length - 1]}` : p[0];
  }
  return user.email || '—';
}

export type StatusCompetenciaLabel = 'DRAFT' | 'PROCESSING' | 'REVIEW' | 'VALIDATED' | 'CLOSED';

export function statusCompetenciaMeta(status: StatusCompetenciaLabel) {
  switch (status) {
    case 'DRAFT':      return { label: 'Rascunho',     variant: 'secondary' as const, tone: 'bg-slate-100 text-slate-700 border-slate-200' };
    case 'PROCESSING': return { label: 'Processando',  variant: 'warn' as const,      tone: 'bg-amber-50 text-amber-800 border-amber-200' };
    case 'REVIEW':     return { label: 'Em revisão',   variant: 'warn' as const,      tone: 'bg-amber-50 text-amber-800 border-amber-200' };
    case 'VALIDATED':  return { label: 'Validado',     variant: 'default' as const,   tone: 'bg-brand-50 text-brand-700 border-brand-200' };
    case 'CLOSED':     return { label: 'Fechado',      variant: 'success' as const,   tone: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  }
}

