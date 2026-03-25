import React from 'react';
import { UserProfile } from '../types';
import { Calendar, CheckCircle, XCircle, AlertTriangle, Dumbbell, Trash2 } from 'lucide-react';
import type { Theme } from '../App';

interface HistoryProps {
  history: UserProfile['history'];
  unit: string;
  onDelete?: (workoutId: string) => void;
  theme?: Theme;
}

function getSessionStatus(exercises: { sets: (number | null)[] }[]) {
  const allPassed = exercises.every(ex => ex.sets.every(r => r === 5));
  const anyFailed = exercises.some(ex => ex.sets.some(r => r !== null && r < 5));
  if (allPassed) return 'perfect';
  if (anyFailed) return 'failed';
  return 'incomplete';
}

export const History: React.FC<HistoryProps> = ({ history, unit, onDelete, theme = 'dark' }) => {
  const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sorted.length === 0) {
      return <div className="p-8 text-center text-base-content/60">
        No workouts completed yet. Start lifting!
      </div>;
  }

  return (
    <div className="space-y-4 pb-20">
      {sorted.map((workout) => {
        const totalVolume = workout.exercises.reduce((vol, ex) => {
           const setsReps = ex.sets.reduce((sum, r) => sum + (r || 0), 0);
           return vol + (setsReps * ex.weight);
        }, 0);

        const status = workout.completed ? getSessionStatus(workout.exercises) : 'incomplete';
        const statusIcon = status === 'perfect'
          ? <CheckCircle size={18} className="text-success" />
          : status === 'failed'
            ? <AlertTriangle size={18} className="text-warning" />
            : <XCircle size={18} className="text-error" />;

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
              {workout.exercises.map((ex, idx) => {
                  const exFailed = ex.sets.some(r => r !== null && r < 5);
                  return (
                      <div key={idx} className="flex justify-between text-sm group">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium transition-colors ${
                              exFailed ? 'text-warning' : 'text-base-content group-hover:text-primary'
                            }`}>{ex.name}</span>
                            {ex.attempt && ex.attempt > 0 && (
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded text-base-content/60 bg-base-300/50">
                                ({ex.attempt})
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4">
                               <span className="font-bold text-base-content/80">{ex.weight} {unit}</span>
                               <span className="font-mono text-base-content/60">
                                 {ex.sets.map((r, i) => {
                                   if (r === null) return '-';
                                   return r;
                                 }).join('/')}
                               </span>
                          </div>
                      </div>
                  );
              })}
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
