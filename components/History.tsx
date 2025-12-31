import React from 'react';
import { UserProfile } from '../types';
import { Calendar, CheckCircle, XCircle, Dumbbell } from 'lucide-react';

interface HistoryProps {
  history: UserProfile['history'];
  unit: string;
}

export const History: React.FC<HistoryProps> = ({ history, unit }) => {
  // Sort by date desc
  const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sorted.length === 0) {
      return <div className="p-8 text-center text-slate-500">No workouts completed yet. Start lifting!</div>;
  }

  return (
    <div className="space-y-4 pb-20">
      {sorted.map((workout) => {
        // Calculate total volume for the workout
        const totalVolume = workout.exercises.reduce((vol, ex) => {
           const setsReps = ex.sets.reduce((sum, r) => sum + (r || 0), 0);
           return vol + (setsReps * ex.weight);
        }, 0);

        return (
          <div key={workout.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-col gap-3 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <span className="text-slate-300 font-medium">{new Date(workout.date).toLocaleDateString()}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${workout.type === 'A' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'}`}>
                      {workout.type}
                  </span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1 text-slate-500 text-xs font-mono" title="Total Volume">
                    <Dumbbell size={12} />
                    <span>{totalVolume.toLocaleString()} {unit}</span>
                 </div>
                 {workout.completed ? <CheckCircle size={18} className="text-green-500" /> : <XCircle size={18} className="text-red-500" />}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {workout.exercises.map((ex, idx) => {
                  return (
                      <div key={idx} className="flex justify-between text-sm group">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-200 font-medium group-hover:text-blue-400 transition-colors">{ex.name}</span>
                            {ex.attempt && ex.attempt > 0 && (
                              <span className="text-xs font-bold text-slate-500 bg-slate-700/30 px-1.5 py-0.5 rounded">
                                ({ex.attempt})
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4">
                               <span className="font-bold text-slate-400">{ex.weight} {unit}</span>
                               <span className="font-mono text-slate-500">{ex.sets.map(r => r === null ? '-' : r).join('/')}</span>
                          </div>
                      </div>
                  );
              })}
            </div>
            {workout.notes && (
                <div className="text-xs text-slate-400 italic mt-1 bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
                    "{workout.notes}"
                </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
