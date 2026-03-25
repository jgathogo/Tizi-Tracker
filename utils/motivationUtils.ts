import { WorkoutSessionData, WorkoutSchedule, ExerciseSession } from '../types';

export interface MotivationSummary {
  weeklyGoal: number;
  workoutsThisWeek: number;
  weeklyGoalMet: boolean;
  sessionStreak: number;
  weeklyStreak: number;
  workoutsThisMonth: number;
  currentMonthName: string;
}

export type SessionOutcome = 'perfect' | 'partial' | 'tough';

// ---------------------------------------------------------------------------
// Centralized message pools — every motivational string in the app lives here
// ---------------------------------------------------------------------------

export const MSG = {
  // After a perfect session (all 5s on every exercise)
  perfectSession: [
    "Nailed every rep! You're dialed in.",
    "Clean sweep — all sets complete. Keep that energy going!",
    "Perfect session! The weights are moving well.",
    "All reps hit. The gains train keeps rolling!",
    "Textbook workout. That's how it's done.",
    "Every set, every rep. You made it look easy.",
    "Nothing left on the table. Solid work!",
  ],

  // After a session with missed reps
  failureSession: [
    "Failing means you're pushing your limits. That's exactly what builds strength.",
    "Every strong lifter has failed thousands of reps. You're in good company.",
    "The bar didn't move today. But you did — you showed up.",
    "Missed reps are data, not defeat. Your body is telling you where the edge is.",
    "Tough sessions build tough lifters. This is part of the process.",
    "Progress isn't always linear. What matters is you keep showing up.",
    "A bad day in the gym still beats a day on the couch.",
    "Failure is how the program finds your limits so it can push past them.",
    "The reps you grind through matter more than the easy ones.",
    "Strength is built in the struggle, not the cruise.",
  ],

  // After a deload is triggered
  deload: [
    "Deloads aren't setbacks — they're launchpads. You'll come back stronger.",
    "Rebuilding takes 2–3 sessions. Lifters often smash their old max after a deload.",
    "Think of this as sharpening the axe. The weight will move easier when you return.",
    "Every plateau is a springboard in disguise. Time to build momentum.",
    "Smart training means knowing when to step back. This is that moment.",
    "Reset, rebuild, surpass. That's the cycle — and you're right on track.",
  ],

  // Dashboard greeting / pre-workout pump-up
  dashboardCta: [
    "Let's crush it today!",
    "Time to get after it!",
    "Let's make it count!",
    "Keep the momentum going!",
    "Another day, another chance to be stronger.",
    "The iron is waiting. Let's go!",
    "Consistency beats everything. Show up again.",
    "You know the drill — let's get to work.",
    "Today's effort is tomorrow's strength.",
  ],

  // When the streak is strong (> 7 days)
  streakHot: [
    "You're on fire — keep it going!",
    "Unstoppable. Don't break the chain!",
    "That streak is looking dangerous. Keep stacking days!",
    "Consistency is your superpower right now.",
    "This is what dedication looks like.",
  ],

  // First workout of the month / no workouts yet
  monthFresh: [
    "Start strong this month!",
    "New month, new gains. Let's set the pace!",
    "Fresh month — time to make it your best one yet.",
    "Day one of the month. Let's build something great.",
  ],

  // Weekly goal met
  weeklyGoalMet: [
    "Weekly goal complete! 🎯",
    "Target hit for the week! Well done. 🎯",
    "Week's work: done. You earned your rest. 🎯",
  ],

  // Weekly goal in progress
  weeklyPush: [
    "keep pushing!",
    "you've got this!",
    "almost there!",
    "stay on track!",
    "don't stop now!",
  ],

  // Start of week, no workouts yet
  weekFresh: [
    "Start your week strong!",
    "New week — time to set the tone!",
    "Monday mindset: get it done.",
    "A fresh week of gains awaits.",
  ],

  // Completion modal footer buttons
  footerPerfect: [
    "Awesome! Let's Go! 💪",
    "Crushed it! 💪",
    "On to the next one! 💪",
    "That's how it's done! 💪",
  ],
  footerFailure: [
    "Showing Up Is Winning 💪",
    "Still Got After It 💪",
    "Tough Days Build Strength 💪",
    "Grind Now, Grow Later 💪",
  ],
  footerDeload: [
    "I'll Come Back Stronger 🔥",
    "Reset & Rebuild 🔥",
    "Sharpen The Axe 🔥",
    "Bounce Back Mode 🔥",
  ],

  // Stall messages for dashboard next-workout preview
  stall: {
    1: [
      "One off day doesn't define you",
      "Bad sessions happen — you'll get it next time",
      "Shake it off and try again",
    ],
    2: [
      "Deload safety net ready if needed",
      "One more shot before the reset — give it everything",
      "Dig deep — you might surprise yourself",
    ],
  } as Record<number, string[]>,

  // Completion modal titles
  titlePerfect: [
    "Great job",
    "Nailed it",
    "Beast mode",
    "Solid work",
  ],
  titleFailure: [
    "Tough one",
    "Still showed up",
    "Gritty session",
    "Battle tested",
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick a random message from any pool by key. */
export function pick(pool: string[]): string {
  return pickRandom(pool);
}

export function getSessionOutcome(exercises: ExerciseSession[]): SessionOutcome {
  const results = exercises.map(ex => ex.sets.every(r => r === 5));
  if (results.every(Boolean)) return 'perfect';
  if (results.some(Boolean)) return 'partial';
  return 'tough';
}

export function getSessionEncouragement(outcome: SessionOutcome): string {
  switch (outcome) {
    case 'perfect': return pick(MSG.perfectSession);
    case 'partial': return pick(MSG.failureSession);
    case 'tough': return pick(MSG.failureSession);
  }
}

export function getDeloadEncouragement(): string {
  return pick(MSG.deload);
}

export function getFailureContextTip(failedSetIndex: number, totalSets: number): string | null {
  if (totalSets <= 1) return null;
  if (failedSetIndex < 2) {
    return "Early-set miss — check your sleep, food, and warmup.";
  }
  return "Late-set miss is normal — you're training at your limit.";
}

export function getStallMessage(failureCount: number): string {
  const pool = MSG.stall[failureCount];
  return pool ? pick(pool) : "Keep pushing";
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

  // Monthly count
  const currentMonthName = now.toLocaleString('en-US', { month: 'long' });
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);
  const workoutsThisMonth = completed.filter(
    (w) => new Date(w.date) >= monthStart
  ).length;

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
    workoutsThisMonth,
    currentMonthName,
  };
}
