import { exerciseLibrary } from '../data/exerciseLibrary';
import type { CompletedWorkout, ExerciseProgress, Feedback, ProgressionMap, WorkoutExercise } from '../types';

const REP_STEP = 1;
const SECOND_STEP = 5;
const MAX_REP_ADJUSTMENT = 3;
const MAX_SECOND_ADJUSTMENT = 15;

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

export function updateProgressionAfterWorkout(
  current: ProgressionMap,
  workout: CompletedWorkout,
): ProgressionMap {
  const next: ProgressionMap = { ...current };

  workout.exercises.forEach((exercise) => {
    const existing = next[exercise.progressionGroup];
    const easyStreak = workout.feedback === 'Easy' ? (existing?.easyStreak ?? 0) + 1 : 0;
    const updated: ExerciseProgress = {
      exerciseId: exercise.id,
      progressionGroup: exercise.progressionGroup,
      easyStreak,
      totalCompleted: (existing?.totalCompleted ?? 0) + 1,
      currentRepsAdjustment: existing?.currentRepsAdjustment ?? 0,
      currentSecondsAdjustment: existing?.currentSecondsAdjustment ?? 0,
      unlockedExerciseId: existing?.unlockedExerciseId,
      lastFeedback: workout.feedback,
      updatedAt: workout.completedAt,
    };

    // Progression is intentionally conservative: two Easy ratings add a tiny workload bump,
    // while three Easy ratings unlock only the next harder variation in the same progression group.
    // Good ratings maintain the current variation with a small ceiling-limited nudge, and Hard
    // ratings reduce added volume before ever changing exercises. This prevents aggressive jumps.
    if (workout.feedback === 'Easy') {
      if (easyStreak >= 2) {
        if (exercise.targetReps || exercise.reps) {
          updated.currentRepsAdjustment = clamp(updated.currentRepsAdjustment + REP_STEP, 0, MAX_REP_ADJUSTMENT);
        }
        if (exercise.targetSeconds || exercise.seconds) {
          updated.currentSecondsAdjustment = clamp(updated.currentSecondsAdjustment + SECOND_STEP, 0, MAX_SECOND_ADJUSTMENT);
        }
      }

      if (easyStreak >= 3) {
        const harder = findNextHarderVariation(exercise);
        if (harder) {
          updated.unlockedExerciseId = harder.id;
          updated.exerciseId = harder.id;
          updated.currentRepsAdjustment = 0;
          updated.currentSecondsAdjustment = 0;
        }
        updated.easyStreak = 0;
      }
    }

    if (workout.feedback === 'Good') {
      updated.currentRepsAdjustment = exercise.reps
        ? clamp(updated.currentRepsAdjustment + 0, 0, MAX_REP_ADJUSTMENT)
        : updated.currentRepsAdjustment;
      updated.currentSecondsAdjustment = exercise.seconds
        ? clamp(updated.currentSecondsAdjustment + 0, 0, MAX_SECOND_ADJUSTMENT)
        : updated.currentSecondsAdjustment;
    }

    if (workout.feedback === 'Hard') {
      updated.currentRepsAdjustment = clamp(updated.currentRepsAdjustment - REP_STEP, 0, MAX_REP_ADJUSTMENT);
      updated.currentSecondsAdjustment = clamp(updated.currentSecondsAdjustment - SECOND_STEP, 0, MAX_SECOND_ADJUSTMENT);
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

export function describeFeedbackEffect(feedback: Feedback) {
  if (feedback === 'Easy') return 'Easy adds a safe streak. Two Easy ratings add a small target bump; three may unlock the next variation.';
  if (feedback === 'Good') return 'Good keeps the current work steady so you can build consistency.';
  return 'Hard lowers added targets and keeps the same variation so recovery can catch up.';
}
