import type { WorkoutExercise } from '../types';
import { Card } from './Card';

export function ExerciseCard({ exercise, index }: { exercise: WorkoutExercise; index?: number }) {
  const repTarget = exercise.targetReps ?? exercise.reps;
  const secondTarget = exercise.targetSeconds ?? exercise.seconds;
  const target = repTarget ? `${repTarget} reps` : `${secondTarget} sec`;

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-300">{exercise.category}</p>
          <h3 className="mt-1 text-xl font-black text-white">{index ? `${index}. ` : ''}{exercise.name}</h3>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">D{exercise.difficulty}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <Metric label="Sets" value={exercise.sets} />
        <Metric label="Target" value={target} />
        <Metric label="Rest" value={`${exercise.restSeconds}s`} />
      </div>
      <p className="text-sm leading-6 text-slate-300">{exercise.instruction}</p>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-slate-950/70 p-3">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}
