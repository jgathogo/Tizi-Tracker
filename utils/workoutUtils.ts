import { WorkoutSessionData, WorkoutSchedule } from '../types';
import { getAdaptiveNextWorkoutDate } from './scheduleUtils';

/**
 * Calculates estimated calories burned during a workout.
 * 
 * Formula:
 * - Base calories: ~5 calories per minute
 * - Volume calories: ~0.1 calories per kg lifted per rep
 * 
 * @param workout - The completed workout session
 * @param unit - Weight unit ('kg' or 'lb')
 * @returns Estimated calories burned (rounded)
 */
export const calculateCalories = (workout: WorkoutSessionData, unit: 'kg' | 'lb'): number => {
  // Calculate total volume (weight × reps for all exercises)
  const totalVolume = workout.exercises.reduce((vol, ex) => {
    const totalReps = ex.sets.reduce((sum, reps) => sum + (reps || 0), 0);
    // Convert to kg if needed for calculation
    const weightKg = unit === 'kg' ? ex.weight : ex.weight * 0.453592;
    return vol + (totalReps * weightKg);
  }, 0);

  // Calculate duration in minutes
  const durationMinutes = workout.endTime && workout.startTime
    ? Math.max(1, Math.round((workout.endTime - workout.startTime) / 1000 / 60))
    : 30; // Default to 30 minutes if duration not available

  // Base calories: ~5 calories per minute for strength training
  const baseCalories = durationMinutes * 5;

  // Volume-based calories: ~0.1 calories per kg lifted per rep
  const volumeCalories = totalVolume * 0.1;

  // Total estimated calories (rounded)
  return Math.round(baseCalories + volumeCalories);
};

/**
 * Calculates the next workout date based on workout schedule and last workout.
 * 
 * Considers:
 * - Last workout date
 * - Schedule frequency (workouts per week)
 * - Preferred days
 * - Minimum rest days between workouts
 * - Actual workout patterns (adaptive)
 * 
 * @param schedule - Optional workout schedule settings
 * @param lastWorkoutDate - Optional date of the last completed workout
 * @param history - Optional array of workout history for pattern analysis
 * @returns The next workout date
 */
export const getNextWorkoutDate = (
  schedule?: WorkoutSchedule, 
  lastWorkoutDate?: Date,
  history?: WorkoutSessionData[]
): Date => {
  // Use adaptive calculation if history is provided
  if (history && history.length > 0) {
    return getAdaptiveNextWorkoutDate(schedule, lastWorkoutDate, history);
  }
  
  // Fall back to original calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight
  const todayDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // If no schedule, default to tomorrow
  if (!schedule) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  // Calculate minimum days between workouts based on frequency
  // e.g., 3x/week = ~2.3 days between, so minimum 1 day rest
  // e.g., 2x/week = ~3.5 days between, so minimum 2 days rest
  const minDaysBetween = schedule.frequency >= 3 ? 1 : schedule.frequency === 2 ? 2 : 3;

  // If we have a last workout date, check if enough time has passed
  if (lastWorkoutDate) {
    const lastDate = new Date(lastWorkoutDate);
    lastDate.setHours(0, 0, 0, 0);
    const daysSinceLast = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // If not enough time has passed, we need to look ahead
    if (daysSinceLast < minDaysBetween) {
      // Need to wait at least minDaysBetween days
      const daysToWait = minDaysBetween - daysSinceLast;
      const earliestDate = new Date(today);
      earliestDate.setDate(today.getDate() + daysToWait);
      const earliestDay = earliestDate.getDay();
      
      // Check if the earliest possible date is a preferred day
      if (schedule.preferredDays.length === 0 || schedule.preferredDays.includes(earliestDay)) {
        return earliestDate;
      }
      
      // Otherwise, find the next preferred day after the minimum wait period
      if (schedule.flexible) {
        for (let i = daysToWait; i <= 14; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() + i);
          const checkDay = checkDate.getDay();
          
          if (schedule.preferredDays.length === 0 || schedule.preferredDays.includes(checkDay)) {
            return checkDate;
          }
        }
      } else {
        // Strict mode: find next preferred day after minimum wait
        const sortedPreferred = [...schedule.preferredDays].sort((a, b) => {
          const aAdj = a <= earliestDay ? a + 7 : a;
          const bAdj = b <= earliestDay ? b + 7 : b;
          return aAdj - bAdj;
        });
        
        const nextDay = sortedPreferred[0] || schedule.preferredDays[0] || 1;
        let daysUntilNext = nextDay <= earliestDay ? (nextDay + 7) - earliestDay : nextDay - earliestDay;
        daysUntilNext = Math.max(daysUntilNext, daysToWait); // Ensure minimum wait
        
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysUntilNext);
        return nextDate;
      }
    }
  }

  // If enough time has passed (or no last workout), check if today is valid
  if (schedule.preferredDays.length === 0 || schedule.preferredDays.includes(todayDay)) {
    // Check if a workout was already done today
    if (lastWorkoutDate) {
      const lastDate = new Date(lastWorkoutDate);
      lastDate.setHours(0, 0, 0, 0);
      const daysSinceLast = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLast === 0) {
        // Workout was done today, so next is tomorrow or later
        // Fall through to find next preferred day
      } else {
        // Enough time has passed, today is valid
        return today;
      }
    } else {
      // No previous workout, today is valid if it's a preferred day
      return today;
    }
  }

  // Find next preferred day
  if (schedule.flexible) {
    for (let i = 1; i <= 14; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const checkDay = checkDate.getDay();
      
      if (schedule.preferredDays.length === 0 || schedule.preferredDays.includes(checkDay)) {
        return checkDate;
      }
    }
  } else {
    // Strict mode: only use preferred days
    const sortedPreferred = [...schedule.preferredDays].sort((a, b) => {
      const aAdj = a <= todayDay ? a + 7 : a;
      const bAdj = b <= todayDay ? b + 7 : b;
      return aAdj - bAdj;
    });
    
    const nextDay = sortedPreferred[0] || schedule.preferredDays[0] || 1;
    const daysUntilNext = nextDay <= todayDay ? (nextDay + 7) - todayDay : nextDay - todayDay;
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilNext);
    return nextDate;
  }

  // Fallback to tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};
