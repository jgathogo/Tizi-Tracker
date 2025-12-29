export type WorkoutType = 'A' | 'B' | 'Custom';

export type ExerciseName = 'Squat' | 'Bench Press' | 'Barbell Row' | 'Overhead Press' | 'Deadlift' | string;

export interface SetData {
  reps: number;
  completed: boolean;
}

export interface ExerciseSession {
  name: ExerciseName;
  weight: number;
  sets: (number | null)[]; // Array of rep counts
  isCustom?: boolean;
}

export interface WorkoutSessionData {
  id: string;
  date: string;
  type: WorkoutType;
  customName?: string;
  exercises: ExerciseSession[];
  notes: string;
  completed: boolean;
  startTime: number;
  endTime?: number;
}

export interface UserProfile {
  currentWeights: Record<string, number>;
  nextWorkout: 'A' | 'B';
  history: WorkoutSessionData[];
  unit: 'lb' | 'kg';
  bodyWeight?: number;
}

export interface SearchResult {
  title: string;
  uri: string;
  source: string;
}

export interface FormGuideData {
  tips: string[];
  videos: SearchResult[];
}