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
  attempt?: number; // How many times this exercise has been done at this weight (1st, 2nd, 3rd time, etc.)
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

export interface WorkoutSchedule {
  frequency: number; // Workouts per week (e.g., 3)
  preferredDays: number[]; // Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
  flexible: boolean; // If true, allow workouts on any day, not just preferred
}

export interface UserProfile {
  currentWeights: Record<string, number>;
  nextWorkout: 'A' | 'B';
  history: WorkoutSessionData[];
  unit: 'lb' | 'kg';
  bodyWeight?: number;
  schedule?: WorkoutSchedule; // Optional workout schedule settings
  exerciseAttempts?: Record<string, number>; // Track attempt number per exercise at current weight (e.g., { "Squat": 2 } means 2nd attempt at current weight)
  repeatCount?: Record<string, number>; // How many times to repeat each exercise at a weight before progressing, per exercise (e.g., { "Squat": 2, "Bench Press": 2 } means repeat Squat 2x, Bench 2x before progressing; default: 2 for each exercise)
  consecutiveFailures?: Record<string, number>; // Track consecutive failures per exercise (e.g., { "Squat": 2 } means 2 consecutive failures at current weight)
  name?: string; // User's name for personalization
  dateOfBirth?: string; // Date of birth (ISO format: YYYY-MM-DD)
  height?: number; // Height in cm
  weightIncrements?: Record<string, number>; // Weight increment per exercise for progression (e.g., { "Squat": 5, "Deadlift": 5 })
  restTimerStartMinimized?: boolean; // When true, auto-started rest timer opens minimized (smaller footprint)
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