import { equipmentLabels } from '../data/exerciseLibrary';
import type { CompletedWorkout, ProgressionMap, Screen, UserSettings } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { getProgressSummary } from '../utils/progressionEngine';

export function Dashboard({ settings, history, progression, onNavigate }: { settings: UserSettings; history: CompletedWorkout[]; progression: ProgressionMap; onNavigate: (screen: Screen) => void }) {
  const latest = history[0];
  const progressCount = getProgressSummary(progression).length;

  return (
    <div className="space-y-6">
      <Header title="Ready for upper body?" subtitle="Generate an adaptive workout based on your level, equipment, and stored progression." />
      <Card className="space-y-4 bg-gradient-to-br from-lime-400 to-emerald-500 text-slate-950">
        <p className="text-sm font-black uppercase tracking-[0.2em] opacity-70">Today&apos;s setup</p>
        <h2 className="text-2xl font-black">{settings.level} upper-body training</h2>
        <p className="font-semibold">{settings.equipment.map((item) => equipmentLabels[item]).join(' • ')}</p>
        <Button full className="mt-2 bg-slate-950 text-white hover:bg-slate-900" onClick={() => onNavigate('generator')}>Generate workout</Button>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-3xl font-black text-white">{history.length}</p>
          <p className="text-sm text-slate-400">Completed workouts</p>
        </Card>
        <Card>
          <p className="text-3xl font-black text-white">{progressCount}</p>
          <p className="text-sm text-slate-400">Tracked progressions</p>
        </Card>
      </div>
      <Card className="space-y-3">
        <h2 className="text-lg font-black text-white">Last session</h2>
        {latest ? (
          <div className="space-y-2 text-sm text-slate-300">
            <p><span className="font-bold text-white">Feedback:</span> {latest.feedback}</p>
            <p><span className="font-bold text-white">Completed:</span> {new Date(latest.completedAt).toLocaleDateString()}</p>
            <p>{latest.exercises.length} movements saved in localStorage.</p>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No workouts yet. Generate your first session to start progression tracking.</p>
        )}
      </Card>
    </div>
  );
}
