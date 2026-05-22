import { Button } from '../components/Button';
import { ExerciseCard } from '../components/ExerciseCard';
import { Header } from '../components/Header';
import type { Workout } from '../types';

export function ActiveWorkoutScreen({ workout, onFinish }: { workout: Workout; onFinish: () => void }) {
  return (
    <div className="space-y-6">
      <Header title="Active workout" subtitle="Complete the movements in order with controlled form, then save your feedback." />
      <div className="space-y-4">
        {workout.exercises.map((exercise, index) => (
          <ExerciseCard key={`${exercise.id}-${index + 1}`} exercise={exercise} index={index + 1} />
        ))}
      </div>
      <Button full onClick={onFinish}>Finish and give feedback</Button>
    </div>
  );
}
