export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="space-y-2">
      <p className="text-xs font-black uppercase tracking-[0.32em] text-lime-300">Calisthenics Progression Trainer</p>
      <h1 className="text-3xl font-black leading-tight text-white">{title}</h1>
      {subtitle ? <p className="text-sm leading-6 text-slate-400">{subtitle}</p> : null}
    </header>
  );
}
