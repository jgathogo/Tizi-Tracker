import React from 'react';
import { X, Trophy, Flame, Calendar, CheckCircle, Dumbbell } from 'lucide-react';
import { WorkoutSessionData, WorkoutType, WorkoutSchedule } from '../types';

interface WorkoutCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: WorkoutSessionData;
  nextWorkout: 'A' | 'B';
  unit: 'kg' | 'lb';
  schedule?: WorkoutSchedule;
  userName?: string;
}

/**
 * Calculates estimated calories burnt based on workout data.
 * 
 * Uses a simple estimation formula:
 * - Base calories for workout duration: ~5 calories per minute
 * - Volume-based calories: ~0.1 calories per kg lifted per rep
 * 
 * Args:
 *   workout: The completed workout session.
 *   unit: Weight unit (kg or lb).
 * 
 * Returns:
 *   number: Estimated calories burnt.
 */
const calculateCalories = (workout: WorkoutSessionData, unit: 'kg' | 'lb'): number => {
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
 * 
 * Args:
 *   schedule: Optional workout schedule settings.
 *   lastWorkoutDate: Optional date of the last completed workout.
 * 
 * Returns:
 *   Date: The next workout date.
 */
const getNextWorkoutDate = (schedule?: WorkoutSchedule, lastWorkoutDate?: Date): Date => {
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

/**
 * Modal component that congratulates the user after completing a workout.
 * 
 * Displays:
 * - Congratulatory message
 * - Workout breakdown (exercises, sets, reps)
 * - Estimated calories burnt
 * - Next workout date
 * 
 * Args:
 *   isOpen: Whether the modal is visible.
 *   onClose: Callback to close the modal.
 *   workout: The completed workout session.
 *   nextWorkout: The next workout type (A or B).
 *   unit: Weight unit (kg or lb).
 * 
 * Returns:
 *   JSX.Element: The workout complete modal.
 */
export const WorkoutCompleteModal: React.FC<WorkoutCompleteModalProps> = ({
  isOpen,
  onClose,
  workout,
  nextWorkout,
  unit,
  schedule,
  userName
}) => {
  if (!isOpen || !workout) return null;

  const calories = calculateCalories(workout, unit);
  // Use the completed workout's date as the last workout date
  const lastWorkoutDate = new Date(workout.date);
  const nextDate = getNextWorkoutDate(schedule, lastWorkoutDate);
  const duration = workout.endTime && workout.startTime
    ? Math.round((workout.endTime - workout.startTime) / 1000 / 60)
    : null;

  // Calculate total volume
  const totalVolume = workout.exercises.reduce((vol, ex) => {
    const totalReps = ex.sets.reduce((sum, reps) => sum + (reps || 0), 0);
    return vol + (totalReps * ex.weight);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-700 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-green-600/20 to-blue-600/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Trophy className="text-green-400" size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                {userName ? `Great job, ${userName}! 🎉` : 'Workout Complete! 🎉'}
              </h3>
              <p className="text-slate-400 text-sm">Great job finishing your session!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Workout Summary */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell size={18} className="text-blue-400" />
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Workout Summary</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Workout Type:</span>
                <span className="text-white font-semibold">
                  {workout.customName || `Workout ${workout.type}`}
                </span>
              </div>
              {duration && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Duration:</span>
                  <span className="text-white font-semibold">{duration} minutes</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Volume:</span>
                <span className="text-white font-semibold">
                  {totalVolume.toLocaleString()} {unit}
                </span>
              </div>
            </div>
          </div>

          {/* Workout Breakdown */}
          <div>
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
              Exercise Breakdown
            </h4>
            <div className="space-y-2">
              {workout.exercises.map((ex, idx) => {
                const totalReps = ex.sets.reduce((sum, reps) => sum + (reps || 0), 0);
                const completedSets = ex.sets.filter(r => r !== null && r > 0).length;
                return (
                  <div
                    key={idx}
                    className="bg-slate-900/50 rounded-lg p-3 border border-slate-700 flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold">{ex.name}</span>
                        <CheckCircle size={14} className="text-green-400" />
                      </div>
                      <div className="text-xs text-slate-400">
                        {ex.weight}{unit} × {completedSets} sets ({totalReps} reps)
                      </div>
                    </div>
                    <div className="text-sm text-slate-300 font-mono">
                      {totalReps * ex.weight} {unit}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Calories */}
            <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-xl p-4 border border-orange-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Flame size={18} className="text-orange-400" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Calories Burnt
                </span>
              </div>
              <div className="text-3xl font-bold text-white">{calories}</div>
              <div className="text-xs text-slate-400 mt-1">Estimated</div>
            </div>

            {/* Next Workout */}
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-xl p-4 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-blue-400" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Next Workout
                </span>
              </div>
              <div className="text-xl font-bold text-white mb-1">
                Workout {nextWorkout}
              </div>
              <div className="text-xs text-slate-400">
                {nextDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-900/50">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
          >
            Awesome! Let's Go! 💪
          </button>
        </div>
      </div>
    </div>
  );
};

