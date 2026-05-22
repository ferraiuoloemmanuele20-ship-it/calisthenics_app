import { exerciseLibrary } from '../data/exerciseLibrary';
import type { Equipment, Level, ProgressionMap, Workout, WorkoutExercise } from '../types';
import { applyProgression } from './progressionEngine';

type WorkoutSlot = 'Pull' | 'Push' | 'Dip' | 'Skill1' | 'Skill2' | 'Handstand' | 'Core';

const levelRank: Record<Level, number> = { Base: 1, Intermediate: 2, Advanced: 3 };
const workoutSlots: WorkoutSlot[] = ['Pull', 'Push', 'Dip', 'Skill1', 'Skill2', 'Handstand', 'Core'];

export function generateWorkout(equipment: Equipment[], level: Level, progression: ProgressionMap): Workout {
  const selected: WorkoutExercise[] = [];
  const usedIds = new Set<string>();
  const usedGroups = new Set<string>();

  workoutSlots.forEach((slot) => {
    const exercise = chooseForSlot(slot, level, equipment, progression, selected, usedIds, usedGroups);
    if (!exercise) return;
    selected.push(exercise);
    usedIds.add(exercise.id);
    usedGroups.add(exercise.progressionGroup);
  });

  // Final safety pass: ensure exactly 7 unique items.
  while (selected.length < workoutSlots.length) {
    const fallback = chooseUniversalFallback(level, equipment, progression, usedIds);
    if (!fallback) break;
    selected.push(fallback);
    usedIds.add(fallback.id);
  }

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    level,
    equipment,
    exercises: selected.slice(0, workoutSlots.length),
  };
}

function chooseForSlot(
  slot: WorkoutSlot,
  level: Level,
  equipment: Equipment[],
  progression: ProgressionMap,
  selected: WorkoutExercise[],
  usedIds: Set<string>,
  usedGroups: Set<string>,
): WorkoutExercise | undefined {
  const strict = pickCandidate(slot, level, equipment, progression, selected, usedIds, usedGroups, true);
  if (strict) return strict;
  return pickCandidate(slot, level, equipment, progression, selected, usedIds, usedGroups, false);
}

function pickCandidate(
  slot: WorkoutSlot,
  level: Level,
  equipment: Equipment[],
  progression: ProgressionMap,
  selected: WorkoutExercise[],
  usedIds: Set<string>,
  usedGroups: Set<string>,
  avoidDuplicateGroups: boolean,
): WorkoutExercise | undefined {
  const candidates = exerciseLibrary
    .filter((exercise) => levelRank[exercise.level] <= levelRank[level])
    .filter((exercise) => hasRequiredEquipment(exercise.equipment, equipment))
    .filter((exercise) => !usedIds.has(exercise.id))
    .filter((exercise) => matchSlot(slot, exercise, selected, equipment))
    .filter((exercise) => (avoidDuplicateGroups ? !usedGroups.has(exercise.progressionGroup) : true))
    .sort((a, b) => scoreCandidate(b, level, equipment, progression) - scoreCandidate(a, level, equipment, progression));

  const chosen = candidates[0] ?? slotFallback(slot, level, equipment, progression, usedIds);
  return chosen ? normalizeForLevel(applyProgression(chosen, progression), level) : undefined;
}

function matchSlot(
  slot: WorkoutSlot,
  exercise: WorkoutExercise,
  selected: WorkoutExercise[],
  equipment: Equipment[],
): boolean {
  const name = exercise.name.toLowerCase();
  const group = exercise.progressionGroup;

  if (slot === 'Pull') {
    return exercise.category === 'Pull';
  }

  if (slot === 'Push') {
    return (
      exercise.category === 'Push'
      && !group.includes('dip')
      && !name.includes('support')
    );
  }

  if (slot === 'Dip') {
    const dipAllowed = equipment.includes('parallelBars') || equipment.includes('rings') || equipment.includes('pullupBar');
    if (dipAllowed) {
      return exercise.category === 'Push' && (group.includes('dip') || name.includes('support'));
    }

    const mainPush = selected.find((item) => item.category === 'Push' && !item.progressionGroup.includes('dip'));
    return exercise.category === 'Push' && mainPush ? exercise.progressionGroup !== mainPush.progressionGroup : exercise.category === 'Push';
  }

  if (slot === 'Skill1') {
    return exercise.category === 'Skill' && (group.includes('front-lever') || name.includes('scapular pull-up') || name.includes('hollow'));
  }

  if (slot === 'Skill2') {
    const skill1 = selected.find((item) => item.category === 'Skill');
    return exercise.category === 'Skill'
      && (!skill1 || exercise.progressionGroup !== skill1.progressionGroup)
      && (
        group.includes('back-lever')
        || group.includes('l-sit')
        || name.includes('german hang')
        || name.includes('skin the cat')
        || name.includes('support')
      );
  }

  if (slot === 'Handstand') {
    return (
      exercise.category === 'Shoulders'
      || name.includes('handstand')
      || name.includes('pike push')
      || name.includes('wall')
    );
  }

  if (slot === 'Core') {
    return exercise.category === 'Core' && !selected.some((item) => item.id === exercise.id);
  }

  return false;
}

function hasRequiredEquipment(required: Equipment[], available: Equipment[]) {
  return required.every((item) => available.includes(item));
}

function scoreCandidate(exercise: WorkoutExercise, level: Level, equipment: Equipment[], progression: ProgressionMap) {
  const levelMatch = exercise.level === level ? 10 : 0;
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

function slotFallback(
  slot: WorkoutSlot,
  level: Level,
  equipment: Equipment[],
  progression: ProgressionMap,
  usedIds: Set<string>,
) {
  const fallbackIds: Record<WorkoutSlot, string[]> = {
    Pull: ['australian-row', 'ring-row', 'negative-pull-up'],
    Push: ['incline-push-up', 'push-up', 'decline-push-up'],
    Dip: ['support-hold-bars', 'support-hold-rings', 'parallel-bar-dip', 'push-up'],
    Skill1: ['scapular-pull-up', 'tuck-front-lever-hold', 'hollow-body-hold'],
    Skill2: ['german-hang-progression', 'skin-the-cat-progression', 'tuck-l-sit-bars'],
    Handstand: ['pike-push-up', 'elevated-pike-push-up', 'wall-handstand-hold'],
    Core: ['hollow-body-hold', 'hanging-knee-raise', 'ring-hanging-knee-raise'],
  };

  const match = fallbackIds[slot]
    .map((id) => exerciseLibrary.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is WorkoutExercise => Boolean(exercise))
    .find((exercise) => levelRank[exercise.level] <= levelRank[level] && hasRequiredEquipment(exercise.equipment, equipment) && !usedIds.has(exercise.id));

  return match ? normalizeForLevel(applyProgression(match, progression), level) : undefined;
}

function chooseUniversalFallback(level: Level, equipment: Equipment[], progression: ProgressionMap, usedIds: Set<string>) {
  const fallback = exerciseLibrary
    .filter((exercise) => levelRank[exercise.level] <= levelRank[level])
    .filter((exercise) => hasRequiredEquipment(exercise.equipment, equipment))
    .filter((exercise) => !usedIds.has(exercise.id))
    .sort((a, b) => a.difficulty - b.difficulty)[0];

  return fallback ? normalizeForLevel(applyProgression(fallback, progression), level) : undefined;
}
