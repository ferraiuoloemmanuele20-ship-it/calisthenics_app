import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/20 ${className}`}>{children}</section>;
}
