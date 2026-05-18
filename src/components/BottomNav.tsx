import type { Screen } from '../types';

const items: Array<{ screen: Screen; label: string }> = [
  { screen: 'dashboard', label: 'Home' },
  { screen: 'generator', label: 'Workout' },
  { screen: 'history', label: 'History' },
  { screen: 'settings', label: 'Settings' },
];

export function BottomNav({ current, onNavigate }: { current: Screen; onNavigate: (screen: Screen) => void }) {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 border-t border-slate-800 bg-slate-950/95 px-3 pt-3 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
        {items.map((item) => (
          <button
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            className={`rounded-2xl px-2 py-3 text-xs font-bold ${current === item.screen ? 'bg-lime-400 text-slate-950' : 'text-slate-400'}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
