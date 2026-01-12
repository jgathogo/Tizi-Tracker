import React from 'react';
import { Info, Dumbbell, Edit2 } from 'lucide-react';
import { ExerciseSession } from '../types';
import { getWeightPerSide, formatPlateBreakdown, getPlateBreakdown } from '../utils/plateCalculator';
import type { Theme } from '../utils/themeColors';

interface ExerciseCardProps {
  exercise: ExerciseSession;
  onSetUpdate: (index: number, reps: number) => void;
  onOpenGuide: (name: string) => void;
  onOpenWarmup: (name: string, weight: number) => void;
  onEditWeight: (name: string, currentWeight: number) => void;
  onEditAttempt?: (exerciseIndex: number, attempt: number) => void;
  exerciseIndex?: number;
  unit: string;
  theme: Theme;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exercise, 
  onSetUpdate, 
  onOpenGuide, 
  onOpenWarmup, 
  onEditWeight,
  onEditAttempt,
  exerciseIndex,
  unit,
  theme
}) => {
  const getCircleColor = (reps: number | null) => {
    if (reps === null) return 'bg-base-300 text-transparent border-base-300'; // Not started
    if (reps === 5) return 'bg-success text-success-content border-success shadow-[0_0_15px_rgba(34,197,94,0.4)]'; // Success
    if (reps === 0) return 'bg-error/20 text-error-content border-error'; // Failed complete
    return 'bg-warning text-warning-content border-warning'; // Partial
  };

  return (
    <div className="bg-base-200 rounded-2xl p-4 md:p-6 shadow-lg border border-base-300 mb-4">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-base-content">{exercise.name}</h3>
            {onEditAttempt !== undefined && exerciseIndex !== undefined ? (
              <button
                onClick={() => {
                  const currentAttempt = exercise.attempt || 1;
                  const newAttempt = prompt(`Enter attempt number for ${exercise.name}:`, currentAttempt.toString());
                  if (newAttempt !== null) {
                    const attemptNum = parseInt(newAttempt, 10);
                    if (!isNaN(attemptNum) && attemptNum > 0) {
                      onEditAttempt(exerciseIndex, attemptNum);
                    }
                  }
                }}
                className="text-xs font-bold text-base-content/70 bg-base-200 hover:bg-base-300 px-2 py-1 rounded-full transition-colors cursor-pointer"
                title="Click to edit attempt number"
              >
                ({exercise.attempt || 1})
              </button>
            ) : (
              exercise.attempt && exercise.attempt > 0 && (
                <span className="text-xs font-bold text-base-content/60 bg-base-200 px-2 py-1 rounded-full">
                  ({exercise.attempt})
                </span>
              )
            )}
          </div>
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => onEditWeight(exercise.name, exercise.weight)}
              className="group flex items-center gap-2 hover:bg-base-300 p-2 -ml-2 rounded-lg transition-all"
              title="Edit Weight"
            >
               <div className="flex items-baseline gap-1">
                 <span className="text-3xl font-bold text-primary group-hover:text-primary/80 transition-colors">{exercise.weight}</span>
                 <span className="text-sm font-medium text-base-content/60">{unit}</span>
               </div>
               <Edit2 size={16} className="text-base-content/50 group-hover:text-primary transition-colors" />
            </button>
            {(() => {
              const weightPerSide = getWeightPerSide(exercise.weight, unit as 'kg' | 'lb');
              const plates = getPlateBreakdown(weightPerSide, unit as 'kg' | 'lb');
              const plateText = formatPlateBreakdown(plates, unit as 'kg' | 'lb');
              if (weightPerSide <= 0) return null;
              return (
                <div className="text-xs text-base-content/60 ml-2">
                  <span className="font-medium">{weightPerSide.toFixed(weightPerSide % 1 === 0 ? 0 : 1)}{unit} / side</span>
                  {plates.length > 0 && (
                    <span className="text-base-content/50 ml-2">({plateText})</span>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => onOpenWarmup(exercise.name, exercise.weight)}
                className="p-2 bg-base-200 hover:bg-base-300 text-base-content/70 hover:text-primary rounded-lg transition-colors"
                title="Warmup Calculator"
            >
                <Dumbbell size={20} />
            </button>
            <button 
                onClick={() => onOpenGuide(exercise.name)}
                className="p-2 bg-base-200 hover:bg-base-300 text-base-content/70 hover:text-primary rounded-lg transition-colors"
                title="Form Guide"
            >
                <Info size={20} />
            </button>
        </div>
      </div>

      <div className="flex justify-between gap-2 md:gap-4">
        {exercise.sets.map((reps, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
             <span className="text-xs text-base-content/50 font-medium">Set {index + 1}</span>
             <button
               onClick={() => {
                 // Cycle logic: 5 -> 4 -> 3 -> 2 -> 1 -> 0 -> 5
                 // Default to 5 if null
                 let nextReps = reps === null ? 5 : reps - 1;
                 if (nextReps < 0) nextReps = 5;
                 onSetUpdate(index, nextReps);
               }}
               className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center text-xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 ${getCircleColor(reps)}`}
             >
               {reps !== null ? reps : ''}
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};
