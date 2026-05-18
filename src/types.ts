export type Equipment = 'pullupBar' | 'parallelBars' | 'rings';
export type Level = 'Base' | 'Intermediate' | 'Advanced';
export type Category = 'Pull' | 'Push' | 'Shoulders' | 'Core' | 'Skill';
export type Feedback = 'Easy' | 'Good' | 'Hard';
export type VideoType = 'youtube' | 'external' | 'local';

export interface UserSettings {
  equipment: Equipment[];
  level: Level;
  onboarded: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  category: Category;
  level: Level;
  equipment: Equipment[];
  sets: number;
  reps?: number;
  seconds?: number;
  restSeconds: number;
  instruction: string;
  videoUrl?: string;
  videoType?: VideoType;
  videoSearchUrl?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  progressionGroup: string;
  order: number;
}

export interface WorkoutExercise extends Exercise {
  targetReps?: number;
  targetSeconds?: number;
}

export interface Workout {
  id: string;
  createdAt: string;
  level: Level;
  equipment: Equipment[];
  exercises: WorkoutExercise[];
}

export interface CompletedWorkout extends Workout {
  completedAt: string;
  feedback: Feedback;
}

export interface ExerciseProgress {
  exerciseId: string;
  progressionGroup: string;
  easyStreak: number;
  totalCompleted: number;
  currentRepsAdjustment: number;
  currentSecondsAdjustment: number;
  unlockedExerciseId?: string;
  lastFeedback?: Feedback;
  updatedAt: string;
}

export type ProgressionMap = Record<string, ExerciseProgress>;

export interface AppState {
  settings: UserSettings | null;
  history: CompletedWorkout[];
  progression: ProgressionMap;
}

export type Screen = 'onboarding' | 'dashboard' | 'generator' | 'active' | 'feedback' | 'history' | 'settings';
