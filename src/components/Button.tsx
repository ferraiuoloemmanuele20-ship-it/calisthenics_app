import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  full?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-lime-400 text-slate-950 shadow-lg shadow-lime-400/20 hover:bg-lime-300',
  secondary: 'bg-slate-800 text-white ring-1 ring-slate-700 hover:bg-slate-700',
  ghost: 'bg-transparent text-slate-300 hover:bg-slate-800',
  danger: 'bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/30 hover:bg-rose-500/25',
};

export function Button({ children, variant = 'primary', full, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-2xl px-5 py-4 text-base font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${
        full ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
