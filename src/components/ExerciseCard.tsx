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
  const [iframeFailed, setIframeFailed] = useState(false);
  const canEmbedYouTube = Boolean(exercise.videoUrl) && exercise.videoType === 'youtube' && !iframeFailed;
  const canEmbedExternal = Boolean(exercise.videoUrl) && exercise.videoType === 'external' && !iframeFailed;
  const canShowLocal = Boolean(exercise.videoUrl) && exercise.videoType === 'local';
  const showFallback = !canEmbedYouTube && !canEmbedExternal && !canShowLocal;

  return (
    <div className="space-y-3 rounded-3xl bg-slate-950 p-3 ring-1 ring-slate-800">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900">
        {canEmbedYouTube ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={exercise.videoUrl}
            title={`${exercise.name} demo video`}
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onError={() => setIframeFailed(true)}
          />
        ) : null}
        {canEmbedExternal ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={exercise.videoUrl}
            title={`${exercise.name} demo video`}
            onError={() => setIframeFailed(true)}
          />
        ) : null}
        {canShowLocal ? <video className="absolute inset-0 h-full w-full" src={exercise.videoUrl} controls /> : null}
        {showFallback ? <DemoFallback searchUrl={exercise.videoSearchUrl} /> : null}
      </div>
      <p className="px-1 text-xs font-semibold leading-5 text-slate-400">Watch the movement carefully before starting the set.</p>
    </div>
  );
}

function DemoFallback({ searchUrl }: { searchUrl?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-bold text-slate-300">Demo video not embedded yet.</p>
      {searchUrl ? (
        <a
          className="rounded-2xl bg-lime-400 px-4 py-3 text-sm font-black text-slate-950 shadow-lg shadow-lime-400/10"
          href={searchUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open demo on YouTube
        </a>
      ) : null}
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
