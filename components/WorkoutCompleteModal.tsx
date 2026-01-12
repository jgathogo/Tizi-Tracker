import React from 'react';
import { X, Trophy, Flame, Calendar, CheckCircle, Dumbbell } from 'lucide-react';
import { WorkoutSessionData, WorkoutType, WorkoutSchedule } from '../types';
import { calculateCalories, getNextWorkoutDate } from '../utils/workoutUtils';

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
      <div className="bg-base-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-base-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-base-300 flex justify-between items-center bg-gradient-to-r from-success/20 to-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/20 rounded-xl">
              <Trophy className="text-success" size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-base-content">
                {userName ? `Great job, ${userName}! 🎉` : 'Workout Complete! 🎉'}
              </h3>
              <p className="text-base-content/60 text-sm">Great job finishing your session!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-base-300 rounded-xl transition-colors text-base-content/60 hover:text-base-content"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Workout Summary */}
          <div className="bg-base-300/50 rounded-xl p-4 border border-base-300">
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell size={18} className="text-primary" />
              <h4 className="text-sm font-bold text-base-content/80 uppercase tracking-wider">Workout Summary</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-base-content/60">Workout Type:</span>
                <span className="text-base-content font-semibold">
                  {workout.customName || `Workout ${workout.type}`}
                </span>
              </div>
              {duration && (
                <div className="flex justify-between items-center">
                  <span className="text-base-content/60">Duration:</span>
                  <span className="text-base-content font-semibold">{duration} minutes</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-base-content/60">Total Volume:</span>
                <span className="text-base-content font-semibold">
                  {totalVolume.toLocaleString()} {unit}
                </span>
              </div>
            </div>
          </div>

          {/* Workout Breakdown */}
          <div>
            <h4 className="text-sm font-bold text-base-content/80 uppercase tracking-wider mb-3">
              Exercise Breakdown
            </h4>
            <div className="space-y-2">
              {workout.exercises.map((ex, idx) => {
                const totalReps = ex.sets.reduce((sum, reps) => sum + (reps || 0), 0);
                const completedSets = ex.sets.filter(r => r !== null && r > 0).length;
                return (
                  <div
                    key={idx}
                    className="bg-base-300/50 rounded-lg p-3 border border-base-300 flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base-content font-semibold">{ex.name}</span>
                        <CheckCircle size={14} className="text-success" />
                      </div>
                      <div className="text-xs text-base-content/60">
                        {ex.weight}{unit} × {completedSets} sets ({totalReps} reps)
                      </div>
                    </div>
                    <div className="text-sm text-base-content/80 font-mono">
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
            <div className="bg-gradient-to-br from-warning/20 to-error/20 rounded-xl p-4 border border-warning/30">
              <div className="flex items-center gap-2 mb-2">
                <Flame size={18} className="text-warning" />
                <span className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
                  Calories Burnt
                </span>
              </div>
              <div className="text-3xl font-bold text-base-content">{calories}</div>
              <div className="text-xs text-base-content/60 mt-1">Estimated</div>
            </div>

            {/* Next Workout */}
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl p-4 border border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-primary" />
                <span className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
                  Next Workout
                </span>
              </div>
              <div className="text-xl font-bold text-base-content mb-1">
                Workout {nextWorkout}
              </div>
              <div className="text-xs text-base-content/60">
                {nextDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-base-300 bg-base-300/50">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-success to-primary hover:from-success/90 hover:to-primary/90 text-base-content py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
          >
            Awesome! Let's Go! 💪
          </button>
        </div>
      </div>
    </div>
  );
};

