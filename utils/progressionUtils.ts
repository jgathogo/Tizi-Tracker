import { ExerciseSession, UserProfile } from '../types';

/**
 * Calculates the next weight and attempt number for an exercise after completing a workout.
 * Implements StrongLifts protocol: tracks consecutive failures and auto-deloads after 3 failures.
 * 
 * @param exercise - The exercise that was completed
 * @param user - The user profile containing progression settings
 * @returns Object with nextWeight, nextAttempt, nextConsecutiveFailures, and deloadInfo
 */
export const calculateProgression = (
  exercise: ExerciseSession,
  user: UserProfile
): { 
  nextWeight: number; 
  nextAttempt: number; 
  nextConsecutiveFailures: number;
  deloadInfo?: { oldWeight: number; newWeight: number; reason: string };
} => {
  const currentWeight = exercise.weight;
  const currentAttempt = exercise.attempt || 1;
  const allSetsDone = exercise.sets.every(r => r === 5);
  
  // Get per-exercise repeat count, fallback to 2 if not set
  const repeatCount = user.repeatCount?.[exercise.name] ?? 2;
  
  // Get current consecutive failures, default to 0
  const currentFailures = user.consecutiveFailures?.[exercise.name] ?? 0;

  if (allSetsDone) {
    // Success: Reset consecutive failures to 0
    // Check if we've completed the required number of attempts
    if (currentAttempt >= repeatCount) {
      // Progress to next weight and reset attempt counter
      // Use user-defined increment, fallback to defaults (2.5kg for most, 5kg for Deadlift)
      const defaultIncrement = exercise.name === 'Deadlift' ? 5 : 2.5;
      const increment = user.weightIncrements?.[exercise.name] ?? defaultIncrement;
      const nextWeight = currentWeight + increment;
      return {
        nextWeight,
        nextAttempt: 1, // Reset to 1st attempt at new weight
        nextConsecutiveFailures: 0 // Reset failures on successful progression
      };
    } else {
      // Same weight, increment attempt counter
      return {
        nextWeight: currentWeight,
        nextAttempt: currentAttempt + 1,
        nextConsecutiveFailures: 0 // Reset failures on success
      };
    }
  } else {
    // Failure: Increment consecutive failures
    const nextFailures = currentFailures + 1;
    
    // Check if we've reached 3 consecutive failures (StrongLifts protocol)
    if (nextFailures >= 3) {
      // Auto-deload: Reduce weight by 10%
      const deloadedWeight = Math.round((currentWeight * 0.9) * 10) / 10; // Round to 1 decimal place
      
      return {
        nextWeight: deloadedWeight,
        nextAttempt: 1, // Reset to 1st attempt at deloaded weight
        nextConsecutiveFailures: 0, // Reset failures after deload
        deloadInfo: {
          oldWeight: currentWeight,
          newWeight: deloadedWeight,
          reason: `Plateau detected. Weight deloaded by 10% to help you recover and progress.`
        }
      };
    } else {
      // Keep same weight and attempt, but increment failure counter
      return {
        nextWeight: currentWeight,
        nextAttempt: currentAttempt,
        nextConsecutiveFailures: nextFailures
      };
    }
  }
};
