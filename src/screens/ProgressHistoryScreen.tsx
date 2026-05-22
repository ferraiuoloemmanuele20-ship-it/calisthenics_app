import { equipmentLabels } from '../data/exerciseLibrary';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import type { CompletedWorkout, ProgressionMap } from '../types';
import { getProgressSummary } from '../utils/progressionEngine';

export function ProgressHistoryScreen({ history, progression, onReset }: { history: CompletedWorkout[]; progression: ProgressionMap; onReset: () => void }) {
  const progress = getProgressSummary(progression);

  return (
    <div className="space-y-6">
      <Header title="Progress history" subtitle="Completed workouts and progression streaks stored locally on this device." />
      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-white">Progression engine</h2>
          <Button variant="danger" onClick={onReset}>Reset</Button>
        </div>
        {progress.length ? (
          <div className="space-y-3">
            {progress.map((item) => (
              <div key={item.progressionGroup} className="rounded-2xl bg-slate-950 p-4">
                <p className="font-black text-white">{item.progressionGroup.replace('-', ' ')}</p>
                <p className="mt-1 text-sm text-slate-400">Easy streak: {item.easyStreak} • Completed: {item.totalCompleted}</p>
                <p className="text-sm text-slate-400">Rep add: +{item.currentRepsAdjustment} • Time add: +{item.currentSecondsAdjustment}s</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Empty state: no progression data yet. Complete a workout and choose feedback to begin.</p>
        )}
      </Card>
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white">Completed workouts</h2>
        {history.length ? history.map((workout) => (
          <Card key={workout.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-black text-white">{workout.level} session</p>
                <p className="text-sm text-slate-400">{new Date(workout.completedAt).toLocaleString()}</p>
              </div>
              <span className="rounded-full bg-lime-400 px-3 py-1 text-xs font-black text-slate-950">{workout.feedback}</span>
            </div>
            <p className="text-sm text-slate-400">{workout.equipment.map((item) => equipmentLabels[item]).join(' • ')}</p>
            <ul className="space-y-1 text-sm text-slate-300">
              {workout.exercises.map((exercise) => <li key={exercise.id}>• {exercise.name}</li>)}
            </ul>
          </Card>
        )) : (
          <Card><p className="text-sm text-slate-400">Empty state: no completed workouts are saved yet.</p></Card>
        )}
      </div>
    </div>
  );
}
