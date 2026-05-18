import { useMemo } from 'react';
import { ExerciseCard } from '../components/ExerciseCard';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import type { ProgressionMap, UserSettings, Workout } from '../types';
import { generateWorkout } from '../utils/workoutGenerator';

export function WorkoutGeneratorScreen({ settings, progression, onStart }: { settings: UserSettings; progression: ProgressionMap; onStart: (workout: Workout) => void }) {
  const workout = useMemo(() => generateWorkout(settings.equipment, settings.level, progression), [settings, progression]);

  return (
    <div className="space-y-6">
      <Header title="Generated workout" subtitle="Review your adaptive upper-body session, then start when ready." />
      <div className="rounded-3xl bg-slate-900 p-2">
        <div className="h-3 rounded-full bg-slate-800"><div className="h-3 w-1/3 rounded-full bg-lime-400" /></div>
        <p className="mt-3 px-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Plan ready • {workout.exercises.length} movements</p>
      </div>
      <div className="space-y-4">
        {workout.exercises.map((exercise, index) => <ExerciseCard key={exercise.id} exercise={exercise} index={index + 1} />)}
      </div>
      <Button full onClick={() => onStart(workout)}>Start active workout</Button>
    </div>
  );
}
