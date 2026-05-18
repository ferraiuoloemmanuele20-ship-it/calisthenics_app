import { exerciseLibrary } from '../data/exerciseLibrary';
import type { Category, Equipment, Level, ProgressionMap, Workout, WorkoutExercise } from '../types';
import { applyProgression } from './progressionEngine';

const levelRank: Record<Level, number> = { Base: 1, Intermediate: 2, Advanced: 3 };
const workoutShape: Record<Level, Category[]> = {
  Base: ['Pull', 'Push', 'Shoulders', 'Core'],
  Intermediate: ['Pull', 'Push', 'Shoulders', 'Core', 'Skill'],
  Advanced: ['Pull', 'Push', 'Shoulders', 'Core', 'Skill'],
};

const targetExerciseCount: Record<Level, number> = { Base: 4, Intermediate: 5, Advanced: 5 };

export function generateWorkout(equipment: Equipment[], level: Level, progression: ProgressionMap): Workout {
  const categories = workoutShape[level];
  const exercises = categories
    .map((category) => chooseExercise(category, level, equipment, progression))
    .filter((exercise): exercise is WorkoutExercise => Boolean(exercise));

  while (exercises.length < targetExerciseCount[level]) {
    const bonus = chooseBonusExercise(level, equipment, progression, exercises.map((item) => item.id));
    if (!bonus) break;
    exercises.push(bonus);
  }

  if (level === 'Advanced' && equipment.includes('rings') && exercises.length < 6) {
    const bonus = chooseExercise('Push', 'Advanced', equipment, progression, exercises.map((item) => item.id));
    if (bonus) exercises.push(bonus);
  }

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    level,
    equipment,
    exercises,
  };
}

function chooseExercise(
  category: Category,
  level: Level,
  equipment: Equipment[],
  progression: ProgressionMap,
  excludedIds: string[] = [],
): WorkoutExercise | undefined {
  const candidates = exerciseLibrary
    .filter((exercise) => exercise.category === category)
    .filter((exercise) => !excludedIds.includes(exercise.id))
    .filter((exercise) => levelRank[exercise.level] <= levelRank[level])
    .filter((exercise) => hasRequiredEquipment(exercise.equipment, equipment))
    .sort((a, b) => scoreCandidate(b, level, equipment, progression) - scoreCandidate(a, level, equipment, progression));

  const selected = candidates[0] ?? fallbackBodyweight(category, level, excludedIds);
  return selected ? normalizeForLevel(applyProgression(selected, progression), level) : undefined;
}

function hasRequiredEquipment(required: Equipment[], available: Equipment[]) {
  return required.every((item) => available.includes(item));
}

function scoreCandidate(exercise: WorkoutExercise, level: Level, equipment: Equipment[], progression: ProgressionMap) {
  const levelMatch = exercise.level === level ? 8 : 0;
  const equipmentMatch = exercise.equipment.some((item) => equipment.includes(item)) ? 3 : 0;
  const progressMatch = progression[exercise.progressionGroup]?.unlockedExerciseId === exercise.id ? 12 : 0;
  return exercise.order + levelMatch + equipmentMatch + progressMatch;
}

function normalizeForLevel(exercise: WorkoutExercise, level: Level): WorkoutExercise {
  const setDefaults: Record<Level, number> = { Base: 3, Intermediate: 4, Advanced: 4 };
  return {
    ...exercise,
    sets: Math.max(exercise.sets, setDefaults[level]),
  };
}

function chooseBonusExercise(level: Level, equipment: Equipment[], progression: ProgressionMap, excludedIds: string[]) {
  const bonusPriority: Category[] = ['Push', 'Pull', 'Core', 'Shoulders', 'Skill'];
  for (const category of bonusPriority) {
    const bonus = chooseExercise(category, level, equipment, progression, excludedIds);
    if (bonus) return bonus;
  }
  return undefined;
}

function fallbackBodyweight(category: Category, level: Level, excludedIds: string[]) {
  const fallbackIdByCategory: Partial<Record<Category, string>> = {
    Push: level === 'Base' ? 'push-up' : 'decline-push-up',
    Shoulders: level === 'Advanced' ? 'wall-handstand-hold' : 'pike-push-up',
    Core: 'hollow-body-hold',
  };
  return exerciseLibrary.find((exercise) => exercise.id === fallbackIdByCategory[category] && !excludedIds.includes(exercise.id));
}
