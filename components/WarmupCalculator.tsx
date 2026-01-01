import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { getWeightPerSide, formatPlateBreakdown, getPlateBreakdown } from '../utils/plateCalculator';

interface WarmupCalculatorProps {
  exerciseName: string;
  workWeight: number;
  unit: string;
  onClose: () => void;
}

export const WarmupCalculator: React.FC<WarmupCalculatorProps> = ({ exerciseName, workWeight, unit, onClose }) => {
  // Store completed warmup sets in localStorage keyed by exercise name and weight
  const storageKey = `warmup_${exerciseName}_${workWeight}`;
  
  const [completedWarmups, setCompletedWarmups] = useState<Set<number>>(new Set());

  // Load completed warmups from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const completed = JSON.parse(saved);
        setCompletedWarmups(new Set(completed));
      } catch (e) {
        console.error('Failed to load warmup state', e);
      }
    }
  }, [storageKey]);

  // Save completed warmups to localStorage
  const saveCompletedWarmups = (completed: Set<number>) => {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(completed)));
  };

  const toggleWarmup = (index: number) => {
    const newCompleted = new Set(completedWarmups);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedWarmups(newCompleted);
    saveCompletedWarmups(newCompleted);
  };

  // Simple logic: Empty bar, then jumps to work weight
  const barWeight = unit === 'kg' ? 20 : 45;
  
  const generateSets = () => {
    if (workWeight <= barWeight) return [];
    
    const sets = [];
    sets.push({ weight: barWeight, reps: 5, label: 'Empty Bar' });
    
    const diff = workWeight - barWeight;
    if (diff > 0) {
      // 40% 
      if (workWeight > barWeight * 2) sets.push({ weight: Math.round(workWeight * 0.4 / 2.5) * 2.5, reps: 5, label: '40%' });
      // 60%
      if (workWeight > barWeight * 1.5) sets.push({ weight: Math.round(workWeight * 0.6 / 2.5) * 2.5, reps: 3, label: '60%' });
      // 80%
      if (workWeight > barWeight * 1.2) sets.push({ weight: Math.round(workWeight * 0.8 / 2.5) * 2.5, reps: 2, label: '80%' });
    }
    
    return sets;
  };

  const warmups = generateSets();

  const allCompleted = warmups.length > 0 && completedWarmups.size === warmups.length;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-700">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-lg font-bold text-white">Warmup: {exerciseName}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
        </div>
        <div className="p-4">
          <div className="mb-4 text-center">
             <span className="text-slate-400 text-sm">Working Weight</span>
             <div className="text-3xl font-bold text-white">{workWeight} <span className="text-lg font-normal text-slate-400">{unit}</span></div>
             {(() => {
               const weightPerSide = getWeightPerSide(workWeight, unit as 'kg' | 'lb');
               const plates = getPlateBreakdown(weightPerSide, unit as 'kg' | 'lb');
               const plateText = formatPlateBreakdown(plates, unit as 'kg' | 'lb');
               if (weightPerSide <= 0) return null;
               return (
                 <div className="text-xs text-slate-400 mt-1">
                   <span className="font-medium">{weightPerSide.toFixed(weightPerSide % 1 === 0 ? 0 : 1)}{unit} / side</span>
                   {plates.length > 0 && (
                     <span className="text-slate-500 ml-2">({plateText})</span>
                   )}
                 </div>
               );
             })()}
          </div>

          <div className="space-y-2">
            {warmups.length === 0 ? (
              <p className="text-center text-slate-400 py-4">No warmup needed (weight is light).</p>
            ) : (
              warmups.map((set, idx) => {
                const isCompleted = completedWarmups.has(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleWarmup(idx)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      isCompleted
                        ? 'bg-green-900/30 border-2 border-green-600/50'
                        : 'bg-slate-700/50 border-2 border-transparent hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-600 text-slate-300'
                      }`}>
                        {isCompleted ? <Check size={16} /> : idx + 1}
                      </div>
                      <div className="text-left">
                        <div className={`font-semibold ${isCompleted ? 'text-green-300 line-through' : 'text-slate-200'}`}>
                          {set.reps} reps @ {set.label}
                        </div>
                        {isCompleted && (
                          <div className="text-xs text-green-400 mt-0.5">Completed</div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xl font-bold ${isCompleted ? 'text-green-400' : 'text-amber-500'}`}>
                          {set.weight}
                        </span>
                        <span className="text-xs text-slate-400">{unit}</span>
                      </div>
                      {(() => {
                        const weightPerSide = getWeightPerSide(set.weight, unit as 'kg' | 'lb');
                        const plates = getPlateBreakdown(weightPerSide, unit as 'kg' | 'lb');
                        const plateText = formatPlateBreakdown(plates, unit as 'kg' | 'lb');
                        if (weightPerSide <= 0) return null;
                        return (
                          <div className="text-xs text-slate-500">
                            <span>{weightPerSide.toFixed(weightPerSide % 1 === 0 ? 0 : 1)}{unit}/side</span>
                            {plates.length > 0 && (
                              <span className="ml-1">({plateText})</span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {warmups.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-400">
                Progress: {completedWarmups.size} / {warmups.length} completed
              </span>
              {allCompleted && (
                <span className="text-green-400 font-semibold flex items-center gap-1">
                  <Check size={16} /> All done!
                </span>
              )}
            </div>
          )}
          
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => {
                // Clear all completed warmups
                setCompletedWarmups(new Set());
                localStorage.removeItem(storageKey);
              }}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-xl transition-colors"
              disabled={completedWarmups.size === 0}
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className={`flex-1 py-3 font-bold rounded-xl transition-colors ${
                allCompleted
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
