import React, { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';

interface WeightAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (weight: number) => void;
  currentWeight: number;
  exerciseName: string;
  unit: 'kg' | 'lb';
}

export const WeightAdjustmentModal: React.FC<WeightAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentWeight,
  exerciseName,
  unit
}) => {
  const [weight, setWeight] = useState(currentWeight);

  useEffect(() => {
    setWeight(currentWeight);
  }, [currentWeight, isOpen]);

  if (!isOpen) return null;

  // Determine increments based on unit
  const baseIncrements = unit === 'kg' ? [1.25, 2.5, 5] : [2.5, 5, 10];
  // Sort descending for display: [5, 2.5, 1.25]
  const sortedIncrements = [...baseIncrements].sort((a, b) => b - a);

  const handleIncrement = (amount: number) => {
    setWeight(prev => {
        const newVal = prev + amount;
        return Math.max(0, Math.round(newVal * 100) / 100); // round to 2 decimals
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-700 transform transition-all">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-lg font-bold text-white">Update Weight</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-slate-400 text-sm mb-1">{exerciseName}</div>
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                className="bg-transparent text-5xl font-bold text-white text-center w-48 focus:outline-none focus:border-b-2 focus:border-blue-500 transition-all"
                step="any"
              />
              <span className="text-xl font-medium text-slate-500 mt-4">{unit}</span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {/* Decrement Row */}
            <div className="grid grid-cols-3 gap-2">
              {sortedIncrements.map((inc) => (
                <button
                  key={`-${inc}`}
                  onClick={() => handleIncrement(-inc)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-1"
                >
                  <Minus size={14} /> {inc}
                </button>
              ))}
            </div>

            {/* Increment Row */}
            <div className="grid grid-cols-3 gap-2">
              {sortedIncrements.map((inc) => (
                <button
                  key={`+${inc}`}
                  onClick={() => handleIncrement(inc)}
                  className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> {inc}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSave(weight)}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-lg shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
          >
            Save Weight
          </button>
        </div>
      </div>
    </div>
  );
};