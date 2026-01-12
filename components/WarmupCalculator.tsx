import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { getWeightPerSide, formatPlateBreakdown, getPlateBreakdown } from '../utils/plateCalculator';

interface WarmupCalculatorProps {
  exerciseName: string;
  workWeight: number;
  unit: string;
  sessionId?: string; // Optional session ID to isolate warmup state per workout session
  onClose: () => void;
  onWarmupComplete?: () => void;
  onStartRestTimer?: (duration: number) => void;
}

export const WarmupCalculator: React.FC<WarmupCalculatorProps> = ({ exerciseName, workWeight, unit, sessionId, onClose, onWarmupComplete, onStartRestTimer }) => {
  // Store completed warmup sets in localStorage keyed by exercise name, weight, and session ID
  // This ensures each workout session has its own warmup state, preventing cross-session persistence
  const storageKey = sessionId 
    ? `warmup_${exerciseName}_${workWeight}_${sessionId}`
    : `warmup_${exerciseName}_${workWeight}`; // Fallback for backward compatibility
  
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
    const wasCompleted = newCompleted.has(index);
    
    if (wasCompleted) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
      // Trigger rest timer when a warmup set is marked as completed
      if (onWarmupComplete) {
        onWarmupComplete();
      }
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

  // Determine rest guideline for each warmup set
  const getRestGuideline = (label: string, weight: number): { text: string; duration: number | null } => {
    if (label === 'Empty Bar') {
      return { text: 'No Rest', duration: null };
    }
    
    // Calculate percentage of work weight
    const percentage = (weight / workWeight) * 100;
    
    if (percentage <= 50) {
      // Light sets (40%): Load & Go
      return { text: 'Load & Go', duration: null };
    } else if (percentage <= 70) {
      // Medium sets (60%): Short rest
      return { text: 'Rest 30s', duration: 30 };
    } else {
      // Heavy sets (80%): Longer rest to prepare for working weight
      return { text: 'Rest 90s', duration: 90 };
    }
  };

  const handleRestClick = (duration: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the warmup toggle
    if (onStartRestTimer) {
      onStartRestTimer(duration);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-base-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-base-300">
        <div className="p-4 border-b border-base-300 flex justify-between items-center bg-base-300/50">
          <h3 className="text-lg font-bold text-base-content">Warmup: {exerciseName}</h3>
          <button onClick={onClose} className="text-base-content/60 hover:text-base-content"><X size={24} /></button>
        </div>
        <div className="p-4">
          <div className="mb-4 text-center">
             <span className="text-base-content/60 text-sm">Working Weight</span>
             <div className="text-3xl font-bold text-base-content">{workWeight} <span className="text-lg font-normal text-base-content/60">{unit}</span></div>
             {(() => {
               const weightPerSide = getWeightPerSide(workWeight, unit as 'kg' | 'lb');
               const plates = getPlateBreakdown(weightPerSide, unit as 'kg' | 'lb');
               const plateText = formatPlateBreakdown(plates, unit as 'kg' | 'lb');
               if (weightPerSide <= 0) return null;
               return (
                 <div className="text-xs text-base-content/60 mt-1">
                   <span className="font-medium">{weightPerSide.toFixed(weightPerSide % 1 === 0 ? 0 : 1)}{unit} / side</span>
                   {plates.length > 0 && (
                     <span className="text-base-content/50 ml-2">({plateText})</span>
                   )}
                 </div>
               );
             })()}
          </div>

          <div className="space-y-2">
            {warmups.length === 0 ? (
              <p className="text-center text-base-content/60 py-4">No warmup needed (weight is light).</p>
            ) : (
              warmups.map((set, idx) => {
                const isCompleted = completedWarmups.has(idx);
                const restGuideline = getRestGuideline(set.label, set.weight);
                return (
                  <div
                    key={idx}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      isCompleted
                        ? 'bg-success/20 border-2 border-success/50'
                        : 'bg-base-300/50 border-2 border-transparent hover:bg-base-300'
                    }`}
                  >
                    <button
                      onClick={() => toggleWarmup(idx)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-success text-success-content'
                          : 'bg-base-300 text-base-content/80'
                      }`}>
                        {isCompleted ? <Check size={16} /> : idx + 1}
                      </div>
                      <div className="text-left flex-1">
                        <div className={`font-semibold ${isCompleted ? 'text-base-content line-through opacity-60' : 'text-base-content'}`}>
                          {set.reps} reps @ {set.label}
                        </div>
                        <div className="mt-1">
                          {restGuideline.duration ? (
                            <span className={`text-xs font-medium ${
                              isCompleted ? 'text-base-content/60' : 'text-base-content/60'
                            }`}>
                              {restGuideline.text}
                            </span>
                          ) : (
                            <span className={`text-xs font-medium ${
                              isCompleted ? 'text-base-content/60' : 'text-base-content/60'
                            }`}>
                              {restGuideline.text}
                            </span>
                          )}
                        </div>
                        {isCompleted && (
                          <div className="text-xs text-base-content/80 mt-0.5 flex items-center gap-1">
                            <Check size={12} className="text-success" />
                            <span>Completed</span>
                          </div>
                        )}
                      </div>
                    </button>
                    <div className="flex flex-col items-end gap-0.5 ml-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xl font-bold ${isCompleted ? 'text-success' : 'text-warning'}`}>
                          {set.weight}
                        </span>
                        <span className="text-xs text-base-content/60">{unit}</span>
                      </div>
                      {(() => {
                        const weightPerSide = getWeightPerSide(set.weight, unit as 'kg' | 'lb');
                        const plates = getPlateBreakdown(weightPerSide, unit as 'kg' | 'lb');
                        const plateText = formatPlateBreakdown(plates, unit as 'kg' | 'lb');
                        if (weightPerSide <= 0) return null;
                        return (
                          <div className="text-xs text-base-content/50">
                            <span>{weightPerSide.toFixed(weightPerSide % 1 === 0 ? 0 : 1)}{unit}/side</span>
                            {plates.length > 0 && (
                              <span className="ml-1">({plateText})</span>
                            )}
                          </div>
                        );
                      })()}
                      {restGuideline.duration && (
                        <button
                          onClick={(e) => handleRestClick(restGuideline.duration!, e)}
                          className={`text-xs font-medium px-2 py-1 rounded transition-colors mt-1 ${
                            isCompleted
                              ? 'text-green-400/70 hover:text-green-400 bg-green-900/20'
                              : 'text-blue-400 hover:text-blue-300 bg-blue-900/20'
                          }`}
                          title={`Click to start ${restGuideline.duration}s rest timer`}
                        >
                          {restGuideline.text}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {warmups.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-base-content/60">
                Progress: {completedWarmups.size} / {warmups.length} completed
              </span>
              {allCompleted && (
                <span className="text-success font-semibold flex items-center gap-1">
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
              className="flex-1 py-3 bg-base-300 hover:bg-base-300/80 text-base-content/80 font-medium rounded-xl transition-colors"
              disabled={completedWarmups.size === 0}
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className={`flex-1 py-3 font-bold rounded-xl transition-colors ${
                allCompleted
                  ? 'btn btn-success'
                  : 'btn btn-primary'
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
