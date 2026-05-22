import { useState } from 'react';
import { Button } from '../components/Button';
import { ExerciseCard } from '../components/ExerciseCard';
import { Header } from '../components/Header';
import type { Workout } from '../types';

export function ActiveWorkoutScreen({ workout, onFinish }: { workout: Workout; onFinish: () => void }) {
  const [completed, setCompleted] = useState<string[]>([]);
  const doneCount = completed.length;
  const percent = Math.round((doneCount / workout.exercises.length) * 100);

  const toggle = (id: string) => setCompleted((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return (
    <div className="space-y-6">
      <Header title="Active workout" subtitle="Check off each movement as you complete all sets. Keep reps clean and controlled." />
      <div className="sticky top-3 z-10 rounded-3xl border border-slate-800 bg-slate-950/90 p-4 backdrop-blur">
        <div className="flex justify-between text-sm font-bold text-slate-300"><span>{doneCount}/{workout.exercises.length} done</span><span>{percent}%</span></div>
        <div className="mt-3 h-3 rounded-full bg-slate-800"><div className="h-3 rounded-full bg-lime-400 transition-all" style={{ width: `${percent}%` }} /></div>
      </div>
      <div className="space-y-4">
        {workout.exercises.map((exercise, index) => {
          const workoutItemKey = exercise.workoutItemId ?? `${exercise.id}-${index + 1}`;
          const isCompleted = completed.includes(workoutItemKey);

          return (
            <div key={workoutItemKey} className={isCompleted ? 'opacity-60' : ''}>
              <ExerciseCard exercise={exercise} index={index + 1} />
              <Button
                full
                variant={isCompleted ? 'secondary' : 'primary'}
                className="mt-3"
                onClick={() => toggle(workoutItemKey)}
              >
                {isCompleted ? 'Completed ✓' : 'Mark complete'}
              </Button>
            </div>
          );
        })}
      </div>
      <Button full disabled={doneCount !== workout.exercises.length} onClick={onFinish}>Finish and give feedback</Button>
    </div>
  );
}
