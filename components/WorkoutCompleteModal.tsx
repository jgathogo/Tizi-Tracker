import React from 'react';
import { X, Trophy, Flame, Calendar, CheckCircle, AlertTriangle, TrendingDown, Dumbbell, ArrowDown, Shield } from 'lucide-react';
import { WorkoutSessionData, WorkoutType, WorkoutSchedule } from '../types';
import { calculateCalories, getNextWorkoutDate } from '../utils/workoutUtils';
import type { MotivationSummary } from '../utils/motivationUtils';
import { getSessionOutcome, getSessionEncouragement, getDeloadEncouragement, pick, MSG } from '../utils/motivationUtils';

export interface DeloadNotification {
  exercise: string;
  oldWeight: number;
  newWeight: number;
  reason: string;
}

interface WorkoutCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: WorkoutSessionData;
  nextWorkout: 'A' | 'B';
  unit: 'kg' | 'lb';
  schedule?: WorkoutSchedule;
  userName?: string;
  motivationAfter?: MotivationSummary;
  deloadNotifications?: DeloadNotification[];
}

export const WorkoutCompleteModal: React.FC<WorkoutCompleteModalProps> = ({
  isOpen,
  onClose,
  workout,
  nextWorkout,
  unit,
  schedule,
  userName,
  motivationAfter,
  deloadNotifications = []
}) => {
  if (!isOpen || !workout) return null;

  const calories = calculateCalories(workout, unit);
  const lastWorkoutDate = new Date(workout.date);
  const nextDate = getNextWorkoutDate(schedule, lastWorkoutDate);
  const duration = workout.endTime && workout.startTime
    ? Math.round((workout.endTime - workout.startTime) / 1000 / 60)
    : null;

  const totalVolume = workout.exercises.reduce((vol, ex) => {
    const totalReps = ex.sets.reduce((sum, reps) => sum + (reps || 0), 0);
    return vol + (totalReps * ex.weight);
  }, 0);

  const mainExercises = workout.exercises.filter(e => e.category === 'main' || (!e.category && !e.isCustom));
  const accessoryExercises = workout.exercises.filter(e => e.category === 'accessory');
  const warmupExercises = workout.exercises.filter(e => e.category === 'warmup');

  const outcome = getSessionOutcome(mainExercises);
  const hasDeloads = deloadNotifications.length > 0;
  const encouragement = getSessionEncouragement(outcome);

  const getHeaderConfig = () => {
    if (hasDeloads) return {
      gradient: 'bg-gradient-to-r from-warning/20 to-error/20',
      icon: <TrendingDown className="text-warning" size={28} />,
      iconBg: 'bg-warning/20',
      title: userName ? `Plateau hit, ${userName}` : 'Plateau Detected',
      emoji: '🔄',
    };
    if (outcome === 'perfect') {
      const label = pick(MSG.titlePerfect);
      return {
        gradient: 'bg-gradient-to-r from-success/20 to-primary/20',
        icon: <Trophy className="text-success" size={28} />,
        iconBg: 'bg-success/20',
        title: userName ? `${label}, ${userName}!` : 'Workout Complete!',
        emoji: '🎉',
      };
    }
    const label = pick(MSG.titleFailure);
    return {
      gradient: 'bg-gradient-to-r from-warning/15 to-primary/20',
      icon: <Shield className="text-primary" size={28} />,
      iconBg: 'bg-primary/20',
      title: userName ? `${label}, ${userName}` : 'Session Logged',
      emoji: '💪',
    };
  };

  const header = getHeaderConfig();

  const subtitle = hasDeloads
    ? getDeloadEncouragement()
    : motivationAfter
      ? motivationAfter.weeklyGoalMet
        ? `Weekly goal: ${motivationAfter.workoutsThisWeek}/${motivationAfter.weeklyGoal} complete! Enjoy your rest. 🎯`
        : motivationAfter.sessionStreak >= 2
          ? `${motivationAfter.sessionStreak} day streak — ${pick(MSG.streakHot).toLowerCase()}`
          : encouragement
      : encouragement;

  const getExerciseStatus = (ex: typeof workout.exercises[0]) => {
    const target = ex.targetReps ?? 5;
    const allHit = ex.sets.every(r => r === target);
    const anyFailed = ex.sets.some(r => r !== null && r < target);
    if (allHit) return 'success';
    if (anyFailed) return 'failed';
    return 'incomplete';
  };

  const getFooterButton = () => {
    if (hasDeloads) return { text: pick(MSG.footerDeload), gradient: 'bg-gradient-to-r from-warning to-primary' };
    if (outcome === 'perfect') return { text: pick(MSG.footerPerfect), gradient: 'bg-gradient-to-r from-success to-primary' };
    return { text: pick(MSG.footerFailure), gradient: 'bg-gradient-to-r from-primary to-secondary' };
  };

  const footer = getFooterButton();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
      <div className="bg-base-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-base-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`p-6 border-b border-base-300 flex justify-between items-center ${header.gradient}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 ${header.iconBg} rounded-xl`}>
              {header.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-base-content">
                {header.title} {header.emoji}
              </h3>
              <p className="text-base-content/60 text-sm">{subtitle}</p>
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
          {/* Deload Banner */}
          {hasDeloads && (
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDown size={16} className="text-warning" />
                <span className="text-sm font-bold text-base-content uppercase tracking-wider">Weight Adjusted</span>
              </div>
              {deloadNotifications.map((d, i) => (
                <div key={i} className="flex items-center justify-between bg-base-300/40 rounded-lg p-3">
                  <span className="text-base-content font-medium">{d.exercise}</span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-base-content/60 line-through">{d.oldWeight}{unit}</span>
                    <span className="text-warning">→</span>
                    <span className="text-warning font-bold">{d.newWeight}{unit}</span>
                  </div>
                </div>
              ))}
              <p className="text-xs text-base-content/60">
                After 3 misses at the same weight, a 10% deload helps you recover and break through. Most lifters surpass their old max within 2–3 sessions.
              </p>
            </div>
          )}

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

          {/* Exercise Breakdown */}
          <div className="space-y-4">
            {[
              { label: 'Main Lifts', exercises: mainExercises },
              ...(accessoryExercises.length > 0 ? [{ label: 'Accessories', exercises: accessoryExercises }] : []),
            ].map(section => (
              <div key={section.label}>
                <h4 className="text-sm font-bold text-base-content/80 uppercase tracking-wider mb-3">
                  {section.label}
                </h4>
                <div className="space-y-2">
                  {section.exercises.map((ex, idx) => {
                    const totalReps = ex.sets.reduce((sum, reps) => sum + (reps || 0), 0);
                    const completedSets = ex.sets.filter(r => r !== null && r > 0).length;
                    const status = getExerciseStatus(ex);
                    const statusIcon = status === 'success'
                      ? <CheckCircle size={14} className="text-success" />
                      : <AlertTriangle size={14} className="text-warning" />;

                    return (
                      <div
                        key={idx}
                        className={`rounded-lg p-3 border flex justify-between items-center ${
                          status === 'success'
                            ? 'bg-base-300/50 border-base-300'
                            : 'bg-warning/5 border-warning/20'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base-content font-semibold">{ex.name}</span>
                            {statusIcon}
                          </div>
                          <div className="text-xs text-base-content/60">
                            {ex.weight > 0 ? `${ex.weight}${unit} × ` : ''}{completedSets} sets ({totalReps} reps)
                          </div>
                        </div>
                        {ex.weight > 0 && (
                          <div className="text-sm text-base-content/80 font-mono">
                            {totalReps * ex.weight} {unit}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Weekly goal crushed banner */}
          {motivationAfter?.weeklyGoalMet && (
            <div className="bg-success/20 border border-success/50 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-success/30 rounded-lg">
                <Trophy className="text-success" size={24} />
              </div>
              <div>
                <div className="font-bold text-base-content">Weekly goal crushed!</div>
                <div className="text-sm text-base-content/80">
                  You hit your {motivationAfter.weeklyGoal}-workout target this week.
                  {motivationAfter.weeklyStreak > 0 && ` ${motivationAfter.weeklyStreak} week streak! 🔥`}
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
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

          {/* Monthly & streak summary */}
          {motivationAfter && (motivationAfter.workoutsThisMonth > 0 || motivationAfter.sessionStreak > 0) && (
            <div className="bg-base-300/40 rounded-xl p-4 border border-base-300 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {motivationAfter.sessionStreak > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Flame size={16} className="text-warning" />
                    <span className="text-sm font-bold text-base-content">{motivationAfter.sessionStreak} day streak</span>
                  </div>
                )}
                {motivationAfter.sessionStreak > 0 && motivationAfter.workoutsThisMonth > 0 && (
                  <span className="text-base-content/30">·</span>
                )}
                {motivationAfter.workoutsThisMonth > 0 && (
                  <span className="text-sm text-base-content/70">
                    {motivationAfter.workoutsThisMonth} in {motivationAfter.currentMonthName}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-base-300 bg-base-300/50">
          <button
            onClick={onClose}
            className={`w-full ${footer.gradient} hover:opacity-90 text-base-content py-4 rounded-xl font-bold text-lg transition-all shadow-lg`}
          >
            {footer.text}
          </button>
        </div>
      </div>
    </div>
  );
};

