import type { AppState, CompletedWorkout, ProgressionMap, UserSettings } from '../types';

const SETTINGS_KEY = 'cpt.settings';
const HISTORY_KEY = 'cpt.history';
const PROGRESSION_KEY = 'cpt.progression';

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

export function resetAllProgress() {
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(PROGRESSION_KEY);
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}
