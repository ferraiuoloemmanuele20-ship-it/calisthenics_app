import type { AppState, CompletedWorkout, ProgressionMap, UserSettings } from '../types';

const SETTINGS_KEY = 'cpt.settings';
const HISTORY_KEY = 'cpt.history';
const PROGRESSION_KEY = 'cpt.progression';
const PREVIOUS_STATE_KEY = 'cpt.previousState';

export interface PreviousStateSnapshot {
  history: CompletedWorkout[];
  progression: ProgressionMap;
  savedAt: string;
}

export function loadState(): AppState {
  return {
    settings: readJson<UserSettings | null>(SETTINGS_KEY, null),
    history: readJson<CompletedWorkout[]>(HISTORY_KEY, []),
    progression: readJson<ProgressionMap>(PROGRESSION_KEY, {}),
  };
}

export function saveSettings(settings: UserSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function saveHistory(history: CompletedWorkout[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function saveProgression(progression: ProgressionMap) {
  localStorage.setItem(PROGRESSION_KEY, JSON.stringify(progression));
}

export function savePreviousState(snapshot: PreviousStateSnapshot) {
  localStorage.setItem(PREVIOUS_STATE_KEY, JSON.stringify(snapshot));
}

export function loadPreviousState(): PreviousStateSnapshot | null {
  return readJson<PreviousStateSnapshot | null>(PREVIOUS_STATE_KEY, null);
}

export function resetAllProgress() {
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(PROGRESSION_KEY);
  localStorage.removeItem(PREVIOUS_STATE_KEY);
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}
