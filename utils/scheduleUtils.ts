import { WorkoutSessionData, WorkoutSchedule } from '../types';
import { getNextWorkoutDate as getNextWorkoutDateOriginal } from './workoutUtils';

/**
 * Analyzes actual workout patterns vs planned schedule
 * 
 * @param history - Array of completed workout sessions
 * @param schedule - Planned workout schedule
 * @returns Analysis of actual vs planned patterns
 */
export interface ScheduleAnalysis {
  actualDays: number[]; // Days of week when workouts actually happened
  actualFrequency: number; // Average workouts per week
  matchesPreferred: boolean; // Whether actual days match preferred days
  suggestion?: string; // Optional suggestion for schedule adjustment
}

export const analyzeWorkoutPattern = (
  history: WorkoutSessionData[],
  schedule?: WorkoutSchedule
): ScheduleAnalysis | null => {
  if (!schedule || history.length === 0) {
    return null;
  }

  // Get completed workouts from last 4 weeks (28 days)
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  
  const recentWorkouts = history
    .filter(w => w.completed && new Date(w.date) >= fourWeeksAgo)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (recentWorkouts.length === 0) {
    return null;
  }

  // Count workouts by day of week
  const dayCounts: Record<number, number> = {};
  recentWorkouts.forEach(workout => {
    const workoutDate = new Date(workout.date);
    const dayOfWeek = workoutDate.getDay();
    dayCounts[dayOfWeek] = (dayCounts[dayOfWeek] || 0) + 1;
  });

  // Get most common workout days (days with at least 2 workouts)
  const actualDays = Object.entries(dayCounts)
    .filter(([_, count]) => count >= 2)
    .map(([day, _]) => parseInt(day))
    .sort((a, b) => a - b);

  // Calculate actual frequency (workouts per week)
  const actualFrequency = (recentWorkouts.length / 4).toFixed(1);
  const actualFreqNum = parseFloat(actualFrequency);

  // Check if actual days match preferred days
  const matchesPreferred = actualDays.length > 0 && 
    actualDays.every(day => schedule.preferredDays.includes(day)) &&
    schedule.preferredDays.every(day => actualDays.includes(day));

  // Generate suggestion
  let suggestion: string | undefined;
  if (!matchesPreferred && actualDays.length > 0) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const actualDayNames = actualDays.map(d => dayNames[d]).join(', ');
    suggestion = `Your workouts are happening on ${actualDayNames}. Consider updating your preferred days in Settings.`;
  } else if (actualFreqNum < schedule.frequency * 0.7) {
    // If actual frequency is less than 70% of planned
    suggestion = `You're averaging ${actualFrequency} workouts per week (planned: ${schedule.frequency}). Consider adjusting your frequency in Settings.`;
  } else if (actualFreqNum > schedule.frequency * 1.3) {
    // If actual frequency is more than 130% of planned
    suggestion = `You're averaging ${actualFrequency} workouts per week (planned: ${schedule.frequency}). Great consistency!`;
  }

  return {
    actualDays,
    actualFrequency: actualFreqNum,
    matchesPreferred,
    suggestion
  };
};

/**
 * Enhanced next workout date calculation that adapts to actual workout patterns
 * 
 * @param schedule - Planned workout schedule
 * @param lastWorkoutDate - Date of last completed workout
 * @param history - Array of completed workout sessions (for pattern analysis)
 * @returns The next workout date, adapted to actual patterns if available
 */
export const getAdaptiveNextWorkoutDate = (
  schedule?: WorkoutSchedule,
  lastWorkoutDate?: Date,
  history: WorkoutSessionData[] = []
): Date => {
  // If we have history, analyze patterns
  if (schedule && history.length > 0) {
    const analysis = analyzeWorkoutPattern(history, schedule);
    
    // If actual days differ from preferred and we have enough data, use actual days
    if (analysis && !analysis.matchesPreferred && analysis.actualDays.length >= 2) {
      // Create a temporary schedule using actual days
      const adaptiveSchedule: WorkoutSchedule = {
        ...schedule,
        preferredDays: analysis.actualDays,
        flexible: true // Always flexible when using actual patterns
      };
      
      // Use the adaptive schedule for calculation (call original without history to avoid recursion)
      return getNextWorkoutDateOriginal(adaptiveSchedule, lastWorkoutDate);
    }
  }

  // Fall back to standard calculation
  return getNextWorkoutDateOriginal(schedule, lastWorkoutDate);
};
