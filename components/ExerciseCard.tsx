import React from 'react';
import { Dumbbell, Edit2, AlertCircle, Youtube } from 'lucide-react';
import { ExerciseSession } from '../types';
import { getWeightPerSide, formatPlateBreakdown, getPlateBreakdown } from '../utils/plateCalculator';
import { getFailureContextTip } from '../utils/motivationUtils';
import type { Theme } from '../utils/themeColors';

const FORM_VIDEOS: Record<string, string> = {
  // Main lifts
  'Squat': 'https://www.youtube.com/watch?v=Uv_DKDl7EjA',
  'Bench Press': 'https://www.youtube.com/watch?v=4Y2ZdHCOXok',
  'Barbell Row': 'https://www.youtube.com/watch?v=kBWAon7ItDw',
  'Overhead Press': 'https://www.youtube.com/watch?v=nNMR9fRGRjQ',
  'Deadlift': 'https://www.youtube.com/watch?v=hCDzSR6bW10',
  // Accessories
  'Barbell Curl': 'https://www.youtube.com/watch?v=kwG2ipFRgFo',
  'Barbell Hip Thrust': 'https://www.youtube.com/watch?v=W86oVlnLqY4',
  'Chin-ups': 'https://www.youtube.com/watch?v=brhRXlOhWAM',
  'Bulgarian Split Squat': 'https://www.youtube.com/watch?v=onUcwAbmZF8',
  // Warmups
  'Jumping Jacks': 'https://www.youtube.com/watch?v=uLVt6u15L98',
  'Bodyweight Squats': 'https://www.youtube.com/watch?v=aclHkVaku9U',
  'Plank (seconds)': 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
  'Mountain Climbers': 'https://www.youtube.com/watch?v=nmwgirgXLYM',
  'Knee High Raises': 'https://www.youtube.com/watch?v=D3hjgcsEETk',
  'High Knees': 'https://www.youtube.com/watch?v=D3hjgcsEETk',
  'Pelvic Bridges': 'https://www.youtube.com/watch?v=OUgsJ8-Vi0E',
  'Dead Bugs': 'https://www.youtube.com/watch?v=I5xbsA71v1A',
  'Lunges (each leg)': 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
  'Arm Circles': 'https://www.youtube.com/watch?v=140RTNMciH8',
  'Push-ups': 'https://www.youtube.com/watch?v=IODxDxX7oi4',
  'Cat-Cow Stretch': 'https://www.youtube.com/watch?v=kqnua4rHVVA',
  'Hip Circles': 'https://www.youtube.com/watch?v=QxGmYOqMi7c',
};

interface ExerciseCardProps {
  exercise: ExerciseSession;
  onSetUpdate: (index: number, reps: number) => void;
  onOpenGuide?: (name: string) => void;
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
  const target = exercise.targetReps ?? 5;
  const isWarmup = exercise.category === 'warmup';
  const isAccessory = exercise.category === 'accessory';

  const getCircleColor = (reps: number | null) => {
    if (reps === null) return 'bg-base-300 text-transparent border-base-300';
    if (reps === target) return 'bg-success text-success-content border-success shadow-[0_0_15px_rgba(34,197,94,0.4)]';
    if (reps === 0) return 'bg-error/20 text-error-content border-error';
    return 'bg-warning text-warning-content border-warning';
  };

  const cardBorder = isWarmup
    ? 'border-info/30'
    : isAccessory
      ? 'border-secondary/30'
      : 'border-base-300';

  const cardBg = isWarmup
    ? 'bg-base-200/70'
    : isAccessory
      ? 'bg-base-200/80'
      : 'bg-base-200';

  return (
    <div className={`${cardBg} rounded-2xl p-4 md:p-6 shadow-lg border ${cardBorder} mb-4`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-xl font-bold ${isWarmup ? 'text-info' : isAccessory ? 'text-secondary' : 'text-base-content'}`}>{exercise.name}</h3>
            {isWarmup && <span className="text-[10px] font-bold uppercase bg-info/10 text-info px-2 py-0.5 rounded-full">warmup</span>}
            {isAccessory && <span className="text-[10px] font-bold uppercase bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">accessory</span>}
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
          {isWarmup ? (
            <div className="text-sm text-base-content/50 mt-1">
              {target} {exercise.name.includes('seconds') || exercise.name.includes('Plank') ? 'sec' : 'reps'} per set
            </div>
          ) : (
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
          )}
        </div>
        <div className="flex gap-2">
          {!isWarmup && !isAccessory && (
            <button 
                onClick={() => onOpenWarmup(exercise.name, exercise.weight)}
                className="p-2 bg-base-200 hover:bg-base-300 text-base-content/70 hover:text-primary rounded-lg transition-colors"
                title="Warmup Calculator"
            >
                <Dumbbell size={20} />
            </button>
          )}
          {FORM_VIDEOS[exercise.name] && (
            <a
              href={FORM_VIDEOS[exercise.name]}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-base-200 hover:bg-red-900/30 text-base-content/70 hover:text-red-400 rounded-lg transition-colors"
              title="Watch form video"
            >
              <Youtube size={20} />
            </a>
          )}
        </div>
      </div>

      <div className="flex justify-between gap-2 md:gap-4">
        {exercise.sets.map((reps, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
             <span className="text-xs text-base-content/50 font-medium">Set {index + 1}</span>
             <button
               onClick={() => {
                 let nextReps = reps === null ? target : reps - 1;
                 if (nextReps < 0) nextReps = target;
                 onSetUpdate(index, nextReps);
               }}
               className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center text-xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 ${getCircleColor(reps)}`}
             >
               {reps !== null ? reps : ''}
             </button>
          </div>
        ))}
      </div>

      {/* Contextual failure tip (main lifts only) */}
      {!isWarmup && !isAccessory && (() => {
        const firstFailedIdx = exercise.sets.findIndex(r => r !== null && r < target);
        if (firstFailedIdx === -1) return null;
        const tip = getFailureContextTip(firstFailedIdx, exercise.sets.length);
        if (!tip) return null;
        return (
          <div className="mt-3 flex items-start gap-2 bg-warning/10 border border-warning/20 rounded-lg px-3 py-2">
            <AlertCircle size={14} className="text-warning flex-shrink-0 mt-0.5" />
            <span className="text-xs text-base-content/70">{tip} Finish all sets — the work still counts.</span>
          </div>
        );
      })()}
    </div>
  );
};
