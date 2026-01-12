/**
 * Calculate rest timer duration based on set performance
 * - 5 reps (success): 90 seconds
 * - 0 reps (failure): 180 seconds (3 minutes)
 * - In between: scales linearly
 * 
 * @param reps - Number of reps completed in the set
 * @returns Rest duration in seconds
 */
export const calculateRestDuration = (reps: number): number => {
  if (reps === 5) return 90;
  if (reps === 0) return 180;
  // Linear interpolation: 90s at 5 reps, 180s at 0 reps
  return Math.round(90 + (5 - reps) * 18);
};
