import { exerciseLibrary } from '../data/exerciseLibrary';
import type { CompletedWorkout, ExerciseProgress, Feedback, ProgressionMap, WorkoutExercise } from '../types';

const REP_STEP = 1;
const SECOND_STEP = 3;
const MAX_REP_ADJUSTMENT = 4;
const MAX_SECOND_ADJUSTMENT = 20;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function applyProgression(exercise: WorkoutExercise, progression: ProgressionMap): WorkoutExercise {
  const groupProgress = progression[exercise.progressionGroup];
  const unlocked = groupProgress?.unlockedExerciseId
    ? exerciseLibrary.find((item) => item.id === groupProgress.unlockedExerciseId)
    : undefined;
  const base = unlocked && unlocked.category === exercise.category ? unlocked : exercise;

  return {
    ...base,
    targetReps: base.reps ? Math.max(1, base.reps + (groupProgress?.currentRepsAdjustment ?? 0)) : undefined,
    targetSeconds: base.seconds ? Math.max(5, base.seconds + (groupProgress?.currentSecondsAdjustment ?? 0)) : undefined,
  };
}

export function updateProgressionAfterWorkout(current: ProgressionMap, workout: CompletedWorkout): ProgressionMap {
  const next: ProgressionMap = { ...current };

  workout.exercises.forEach((exercise) => {
    const existing = next[exercise.progressionGroup];
    const updated: ExerciseProgress = {
      exerciseId: exercise.id,
      progressionGroup: exercise.progressionGroup,
      easyStreak: workout.feedback === 'Easy' ? 1 : 0,
      totalCompleted: (existing?.totalCompleted ?? 0) + 1,
      currentRepsAdjustment: existing?.currentRepsAdjustment ?? 0,
      currentSecondsAdjustment: existing?.currentSecondsAdjustment ?? 0,
      unlockedExerciseId: existing?.unlockedExerciseId,
      previousUnlockedExerciseId: existing?.unlockedExerciseId,
      previousRepsAdjustment: existing?.currentRepsAdjustment ?? 0,
      previousSecondsAdjustment: existing?.currentSecondsAdjustment ?? 0,
      lastFeedback: workout.feedback,
      updatedAt: workout.completedAt,
    };

    // New policy: Easy should immediately progress. We conservatively add a small target bump,
    // then move to the next variation in the progression chain when available.
    if (workout.feedback === 'Easy') {
      if (exercise.targetReps || exercise.reps) {
        updated.currentRepsAdjustment = clamp(updated.currentRepsAdjustment + REP_STEP, 0, MAX_REP_ADJUSTMENT);
      }
      if (exercise.targetSeconds || exercise.seconds) {
        updated.currentSecondsAdjustment = clamp(updated.currentSecondsAdjustment + SECOND_STEP, 0, MAX_SECOND_ADJUSTMENT);
      }

      const harder = findNextHarderVariation(exercise);
      if (harder) {
        updated.unlockedExerciseId = harder.id;
        updated.exerciseId = harder.id;
      }
    }

    // Good keeps everything unchanged.
    if (workout.feedback === 'Good') {
      updated.currentRepsAdjustment = existing?.currentRepsAdjustment ?? 0;
      updated.currentSecondsAdjustment = existing?.currentSecondsAdjustment ?? 0;
      updated.unlockedExerciseId = existing?.unlockedExerciseId;
      updated.previousUnlockedExerciseId = existing?.previousUnlockedExerciseId;
      updated.previousRepsAdjustment = existing?.previousRepsAdjustment ?? 0;
      updated.previousSecondsAdjustment = existing?.previousSecondsAdjustment ?? 0;
    }

    // Hard regresses by returning to previous version when available, otherwise reducing targets.
    if (workout.feedback === 'Hard') {
      if (existing?.previousUnlockedExerciseId || existing?.previousRepsAdjustment !== undefined || existing?.previousSecondsAdjustment !== undefined) {
        updated.unlockedExerciseId = existing?.previousUnlockedExerciseId;
        updated.currentRepsAdjustment = clamp(existing?.previousRepsAdjustment ?? 0, 0, MAX_REP_ADJUSTMENT);
        updated.currentSecondsAdjustment = clamp(existing?.previousSecondsAdjustment ?? 0, 0, MAX_SECOND_ADJUSTMENT);
      } else {
        updated.currentRepsAdjustment = clamp((existing?.currentRepsAdjustment ?? 0) - REP_STEP, 0, MAX_REP_ADJUSTMENT);
        updated.currentSecondsAdjustment = clamp((existing?.currentSecondsAdjustment ?? 0) - SECOND_STEP, 0, MAX_SECOND_ADJUSTMENT);
      }

      const currentExercise = existing?.unlockedExerciseId
        ? exerciseLibrary.find((item) => item.id === existing.unlockedExerciseId) ?? exercise
        : exercise;
      const easier = findPreviousVariation(currentExercise);
      if (easier) {
        updated.unlockedExerciseId = easier.id;
        updated.exerciseId = easier.id;
      }
    }

    next[exercise.progressionGroup] = updated;
  });

  return next;
}

export function getProgressSummary(progression: ProgressionMap) {
  return Object.values(progression).sort((a, b) => a.progressionGroup.localeCompare(b.progressionGroup));
}

function findNextHarderVariation(exercise: WorkoutExercise) {
  return exerciseLibrary
    .filter((candidate) => candidate.progressionGroup === exercise.progressionGroup)
    .filter((candidate) => candidate.order > exercise.order)
    .sort((a, b) => a.order - b.order)[0];
}

function findPreviousVariation(exercise: WorkoutExercise) {
  return exerciseLibrary
    .filter((candidate) => candidate.progressionGroup === exercise.progressionGroup)
    .filter((candidate) => candidate.order < exercise.order)
    .sort((a, b) => b.order - a.order)[0];
}

export function describeFeedbackEffect(feedback: Feedback) {
  if (feedback === 'Easy') return 'Easy = next workout becomes harder.';
  if (feedback === 'Good') return 'Good = next workout stays the same.';
  return 'Hard = next workout becomes easier or returns to previous version.';
}
