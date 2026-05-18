import { useState } from 'react';
import type { WorkoutExercise } from '../types';
import { Card } from './Card';

export function ExerciseCard({ exercise, index }: { exercise: WorkoutExercise; index?: number }) {
  const [showDemo, setShowDemo] = useState(false);
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
      <button
        className="w-full rounded-2xl bg-slate-800 px-4 py-3 text-sm font-black text-lime-200 ring-1 ring-slate-700 transition hover:bg-slate-700"
        onClick={() => setShowDemo((current) => !current)}
      >
        {showDemo ? 'Hide demo' : 'Watch demo'}
      </button>
      {showDemo ? <ExerciseDemo exercise={exercise} /> : null}
    </Card>
  );
}

function ExerciseDemo({ exercise }: { exercise: WorkoutExercise }) {
  const hasVideo = Boolean(exercise.videoUrl);

  return (
    <div className="space-y-3 rounded-3xl bg-slate-950 p-3 ring-1 ring-slate-800">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900">
        {hasVideo && exercise.videoType === 'youtube' ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={exercise.videoUrl}
            title={`${exercise.name} demo video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : null}
        {hasVideo && exercise.videoType === 'external' ? (
          <iframe className="absolute inset-0 h-full w-full" src={exercise.videoUrl} title={`${exercise.name} demo video`} />
        ) : null}
        {hasVideo && exercise.videoType === 'local' ? (
          <video className="absolute inset-0 h-full w-full" src={exercise.videoUrl} controls />
        ) : null}
        {!hasVideo ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold text-slate-400">
            Demo video coming soon.
          </div>
        ) : null}
      </div>
      <p className="px-1 text-xs font-semibold leading-5 text-slate-400">Watch the movement carefully before starting the set.</p>
    </div>
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
