import React from 'react';
import { X } from 'lucide-react';

interface WarmupCalculatorProps {
  exerciseName: string;
  workWeight: number;
  unit: string;
  onClose: () => void;
}

export const WarmupCalculator: React.FC<WarmupCalculatorProps> = ({ exerciseName, workWeight, unit, onClose }) => {
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
          </div>

          <div className="space-y-2">
            {warmups.length === 0 ? (
              <p className="text-center text-slate-400 py-4">No warmup needed (weight is light).</p>
            ) : (
              warmups.map((set, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-slate-600 rounded-full text-xs font-bold text-slate-300">{idx + 1}</span>
                    <span className="font-semibold text-slate-200">{set.reps} reps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-amber-500">{set.weight}</span>
                    <span className="text-xs text-slate-400">{unit}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <button onClick={onClose} className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
