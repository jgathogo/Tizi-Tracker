import React from 'react';
import { UserProfile, ExerciseSession } from '../types';
import { Calendar, CheckCircle, XCircle, AlertTriangle, Dumbbell, Trash2, Clock } from 'lucide-react';
import type { Theme } from '../utils/themeColors';

interface HistoryProps {
  history: UserProfile['history'];
  unit: string;
  onDelete?: (workoutId: string) => void;
  theme?: Theme;
}

function getSessionStatus(exercises: ExerciseSession[]) {
  const mains = exercises.filter(e => e.category === 'main' || (!e.category && !e.isCustom));
  const exs = mains.length > 0 ? mains : exercises;
  const allPassed = exs.every(ex => {
    const target = ex.targetReps ?? 5;
    return ex.sets.every(r => r === target);
  });
  const anyFailed = exs.some(ex => {
    const target = ex.targetReps ?? 5;
    return ex.sets.some(r => r !== null && r < target);
  });
  if (allPassed) return 'perfect';
  if (anyFailed) return 'failed';
  return 'incomplete';
}

function formatDuration(startTime: number, endTime?: number): string | null {
  if (!endTime) return null;
  const mins = Math.round((endTime - startTime) / 1000 / 60);
  if (mins < 1) return '<1 min';
  return `${mins} min`;
}

export const History: React.FC<HistoryProps> = ({ history, unit, onDelete, theme = 'dark' }) => {
  const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sorted.length === 0) {
      return <div className="p-8 text-center text-base-content/60">
        No workouts completed yet. Start lifting!
      </div>;
  }

  const renderExerciseRow = (ex: ExerciseSession, idx: number) => {
    const target = ex.targetReps ?? 5;
    const exFailed = ex.sets.some(r => r !== null && r < target);
    const isWarmup = ex.category === 'warmup';
    const isAccessory = ex.category === 'accessory';

    return (
      <div key={idx} className="flex justify-between text-sm group">
        <div className="flex items-center gap-2">
          <span className={`font-medium transition-colors ${
            isWarmup ? 'text-info/70' :
            isAccessory ? 'text-secondary/80' :
            exFailed ? 'text-warning' : 'text-base-content group-hover:text-primary'
          }`}>{ex.name}</span>
          {ex.attempt && ex.attempt > 0 && !isWarmup && !isAccessory && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded text-base-content/60 bg-base-300/50">
              ({ex.attempt})
            </span>
          )}
        </div>
        <div className="flex gap-4">
          {ex.weight > 0 && (
            <span className="font-bold text-base-content/80">{ex.weight} {unit}</span>
          )}
          <span className="font-mono text-base-content/60">
            {ex.sets.map(r => r === null ? '-' : r).join('/')}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-20">
      {sorted.map((workout) => {
        const totalVolume = workout.exercises.reduce((vol, ex) => {
           const setsReps = ex.sets.reduce((sum, r) => sum + (r || 0), 0);
           return vol + (setsReps * ex.weight);
        }, 0);

        const duration = formatDuration(workout.startTime, workout.endTime);
        const status = workout.completed ? getSessionStatus(workout.exercises) : 'incomplete';
        const statusIcon = status === 'perfect'
          ? <CheckCircle size={18} className="text-success" />
          : status === 'failed'
            ? <AlertTriangle size={18} className="text-warning" />
            : <XCircle size={18} className="text-error" />;

        const mains = workout.exercises.filter(e => e.category === 'main' || (!e.category && !e.isCustom));
        const accessories = workout.exercises.filter(e => e.category === 'accessory');
        const warmups = workout.exercises.filter(e => e.category === 'warmup');
        const hasSections = warmups.length > 0 || accessories.length > 0;

        return (
          <div key={workout.id} className="rounded-xl p-4 border flex flex-col gap-3 shadow-sm bg-base-200 border-base-300">
            <div className="flex justify-between items-center border-b pb-2 border-base-300">
              <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-base-content/60" />
                  <span className="font-medium text-base-content">{new Date(workout.date).toLocaleDateString()}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${workout.type === 'A' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                      {workout.type}
                  </span>
              </div>
              <div className="flex items-center gap-3">
                 {duration && (
                   <div className="flex items-center gap-1 text-xs text-base-content/70" title="Duration">
                     <Clock size={12} />
                     <span>{duration}</span>
                   </div>
                 )}
                 <div className="flex items-center gap-1 text-xs font-mono text-base-content/60" title="Total Volume">
                    <Dumbbell size={12} />
                    <span>{totalVolume.toLocaleString()} {unit}</span>
                 </div>
                 {statusIcon}
                 {onDelete && (
                   <button
                     onClick={() => onDelete(workout.id)}
                     className="p-1.5 rounded-lg transition-colors text-base-content/60 hover:text-error hover:bg-error/20"
                     title="Delete workout"
                   >
                     <Trash2 size={16} />
                   </button>
                 )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {hasSections ? (
                <>
                  {mains.length > 0 && mains.map((ex, idx) => renderExerciseRow(ex, idx))}
                  {accessories.length > 0 && (
                    <>
                      <div className="border-t border-base-300/50 mt-1 pt-1" />
                      {accessories.map((ex, idx) => renderExerciseRow(ex, idx + mains.length))}
                    </>
                  )}
                </>
              ) : (
                workout.exercises.map((ex, idx) => renderExerciseRow(ex, idx))
              )}
            </div>
            {workout.notes && (
                <div className="text-xs italic mt-1 p-3 rounded-lg border text-base-content/60 bg-base-300/40 border-base-300/50">
                    "{workout.notes}"
                </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
