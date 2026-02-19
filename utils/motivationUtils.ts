import { WorkoutSessionData, WorkoutSchedule } from '../types';

export interface MotivationSummary {
  weeklyGoal: number;
  workoutsThisWeek: number;
  weeklyGoalMet: boolean;
  sessionStreak: number;
  weeklyStreak: number;
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

  // Session streak: consecutive days with at least one completed workout (most recent first)
  const seenDates = new Set<string>();
  const uniqueDates: string[] = [];
  for (const w of completed) {
    const key = new Date(w.date).toDateString();
    if (seenDates.has(key)) continue;
    seenDates.add(key);
    uniqueDates.push(key);
  }
  uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const nowMs = now.getTime();
  const today = now.toDateString();
  let sessionStreak = 0;
  let prevDate: string | null = null;
  const oneDayMs = 24 * 60 * 60 * 1000;
  for (const d of uniqueDates) {
    if (new Date(d).getTime() > nowMs) continue; // skip future dates
    const prevTime = prevDate ? new Date(prevDate).getTime() : null;
    const currTime = new Date(d).getTime();
    if (prevDate === null) {
      // First (most recent) workout: count if today or yesterday
      if (d === today || currTime >= nowMs - oneDayMs) {
        sessionStreak = 1;
        prevDate = d;
      } else break;
    } else {
      const dayDiff = Math.round((prevTime - currTime) / oneDayMs);
      if (dayDiff === 1) {
        sessionStreak++;
        prevDate = d;
      } else break;
    }
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
