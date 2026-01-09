import { ExerciseSession, UserProfile } from '../types';

/**
 * Calculates the next weight and attempt number for an exercise after completing a workout.
 * 
 * @param exercise - The exercise that was completed
 * @param user - The user profile containing progression settings
 * @returns Object with nextWeight and nextAttempt
 */
export const calculateProgression = (
  exercise: ExerciseSession,
  user: UserProfile
): { nextWeight: number; nextAttempt: number } => {
  const currentWeight = exercise.weight;
  const currentAttempt = exercise.attempt || 1;
  const allSetsDone = exercise.sets.every(r => r === 5);
  
  // Get per-exercise repeat count, fallback to 2 if not set
  const repeatCount = user.repeatCount?.[exercise.name] ?? 2;

  if (allSetsDone) {
    // Check if we've completed the required number of attempts
    if (currentAttempt >= repeatCount) {
      // Progress to next weight and reset attempt counter
      // Use user-defined increment, fallback to defaults (2.5kg for most, 5kg for Deadlift)
      const defaultIncrement = exercise.name === 'Deadlift' ? 5 : 2.5;
      const increment = user.weightIncrements?.[exercise.name] ?? defaultIncrement;
      const nextWeight = currentWeight + increment;
      return {
        nextWeight,
        nextAttempt: 1 // Reset to 1st attempt at new weight
      };
    } else {
      // Same weight, increment attempt counter
      return {
        nextWeight: currentWeight,
        nextAttempt: currentAttempt + 1
      };
    }
  } else {
    // Sets not all completed, keep same weight and attempt
    return {
      nextWeight: currentWeight,
      nextAttempt: currentAttempt
    };
  }
};
