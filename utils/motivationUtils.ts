import { WorkoutSessionData, WorkoutSchedule, ExerciseSession } from '../types';

export interface MotivationSummary {
  weeklyGoal: number;
  workoutsThisWeek: number;
  weeklyGoalMet: boolean;
  sessionStreak: number;
  weeklyStreak: number;
}

export type SessionOutcome = 'perfect' | 'partial' | 'tough';

const FAILURE_ENCOURAGEMENTS = [
  "Failing means you're pushing your limits. That's exactly what builds strength.",
  "Every strong lifter has failed thousands of reps. You're in good company.",
  "The bar didn't move today. But you did — you showed up.",
  "Missed reps are data, not defeat. Your body is telling you where the edge is.",
  "Tough sessions build tough lifters. This is part of the process.",
  "Progress isn't always linear. What matters is you keep showing up.",
  "A bad day in the gym still beats a day on the couch.",
  "Failure is how the program finds your limits so it can push past them.",
];

const DELOAD_ENCOURAGEMENTS = [
  "Deloads aren't setbacks — they're launchpads. You'll come back stronger.",
  "Rebuilding takes 2–3 sessions. Lifters often smash their old max after a deload.",
  "Think of this as sharpening the axe. The weight will move easier when you return.",
  "Every plateau is a springboard in disguise. Time to build momentum.",
];

const PERFECT_SESSION_MESSAGES = [
  "Nailed every rep! You're dialed in.",
  "Clean sweep — all sets complete. Keep that energy going!",
  "Perfect session! The weights are moving well.",
  "All reps hit. The gains train keeps rolling!",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Determines the overall outcome of a workout session.
 */
export function getSessionOutcome(exercises: ExerciseSession[]): SessionOutcome {
  const results = exercises.map(ex => ex.sets.every(r => r === 5));
  if (results.every(Boolean)) return 'perfect';
  if (results.some(Boolean)) return 'partial';
  return 'tough';
}

/**
 * Returns a context-aware encouragement message based on session outcome.
 */
export function getSessionEncouragement(outcome: SessionOutcome): string {
  switch (outcome) {
    case 'perfect': return pickRandom(PERFECT_SESSION_MESSAGES);
    case 'partial': return pickRandom(FAILURE_ENCOURAGEMENTS);
    case 'tough': return pickRandom(FAILURE_ENCOURAGEMENTS);
  }
}

/**
 * Returns an encouraging deload message.
 */
export function getDeloadEncouragement(): string {
  return pickRandom(DELOAD_ENCOURAGEMENTS);
}

/**
 * Returns a contextual tip based on which set failed in an exercise.
 * Early failures (sets 1-2) suggest recovery issues.
 * Late failures (sets 4-5) are normal and expected.
 */
export function getFailureContextTip(failedSetIndex: number, totalSets: number): string | null {
  if (totalSets <= 1) return null;
  const isEarly = failedSetIndex < 2;
  if (isEarly) {
    return "Early-set miss — check your sleep, food, and warmup.";
  }
  return "Late-set miss is normal — you're training at your limit.";
}

/**
 * Returns a short stall encouragement for the dashboard preview.
 */
export function getStallMessage(failureCount: number): string {
  switch (failureCount) {
    case 1: return "One off day doesn't define you";
    case 2: return "Deload safety net ready if needed";
    default: return "Keep pushing";
  }
}

/**
 * Get start of week (Monday) for a date.
 */
function getWeekStart(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Returns a motivation summary: weekly goal, workouts this week, session streak, weekly streak.
 */
export function getMotivationSummary(
  history: WorkoutSessionData[],
  schedule?: WorkoutSchedule
): MotivationSummary {
  const weeklyGoal = schedule?.frequency ?? 3;
  const completed = history
    .filter((w) => w.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const now = new Date();
  const thisWeekStart = getWeekStart(now);
  const workoutsThisWeek = completed.filter(
    (w) => new Date(w.date) >= thisWeekStart
  ).length;
  const weeklyGoalMet = workoutsThisWeek >= weeklyGoal;

  // Workout streak: consecutive workouts without missing a scheduled window.
  // Max allowed gap between workouts is based on frequency (e.g. 3x/week → ~3 day max gap).
  // The streak value is the total calendar days from the oldest qualifying workout to today.
  const oneDayMs = 24 * 60 * 60 * 1000;
  const maxGapDays = Math.ceil(7 / weeklyGoal) + 1;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  let sessionStreak = 0;
  let streakStartDate: Date | null = null;
  let prevWorkoutDate: Date | null = null;

  for (const w of completed) {
    const wDate = new Date(w.date);
    wDate.setHours(0, 0, 0, 0);
    if (wDate.getTime() > today.getTime()) continue;

    if (prevWorkoutDate === null) {
      const daysSinceLast = Math.floor((today.getTime() - wDate.getTime()) / oneDayMs);
      if (daysSinceLast > maxGapDays) break;
      streakStartDate = wDate;
      prevWorkoutDate = wDate;
    } else {
      if (prevWorkoutDate.getTime() === wDate.getTime()) continue;
      const gap = Math.floor((prevWorkoutDate.getTime() - wDate.getTime()) / oneDayMs);
      if (gap > maxGapDays) break;
      streakStartDate = wDate;
      prevWorkoutDate = wDate;
    }
  }

  if (streakStartDate) {
    sessionStreak = Math.floor((today.getTime() - streakStartDate.getTime()) / oneDayMs) + 1;
  }

  // Weekly streak: consecutive weeks (including current) that met the goal
  let weeklyStreak = 0;
  let weekStart = getWeekStart(now);
  while (true) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    const count = completed.filter((w) => {
      const t = new Date(w.date).getTime();
      return t >= weekStart.getTime() && t <= weekEnd.getTime();
    }).length;
    if (count >= weeklyGoal) {
      weeklyStreak++;
      weekStart.setDate(weekStart.getDate() - 7);
    } else {
      break;
    }
  }

  return {
    weeklyGoal,
    workoutsThisWeek,
    weeklyGoalMet,
    sessionStreak,
    weeklyStreak,
  };
}
