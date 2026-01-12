/**
 * Integration tests for workout completion flow (Issue #28)
 * 
 * Issue #28: Bench Press and Barbell Row weights were resetting to default values
 * (20kg and 30kg) instead of progressing after a successful workout.
 * 
 * Root Cause: The finishWorkout function was using stale closure values (user from closure)
 * instead of the latest state, causing weights to reset when state updates happened.
 * 
 * Fix: Refactored finishWorkout to use functional setState (setUser(prev => {...}))
 * to always work with the latest state, preventing stale closure bugs.
 * 
 * These tests verify that the progression logic works correctly for the specific
 * scenario from issue #28, ensuring weights progress correctly and don't reset.
 */

import { describe, it, expect } from 'vitest';
import { UserProfile, ExerciseSession } from './types';
import { calculateProgression } from './utils/progressionUtils';

describe('Workout Completion Flow - Issue #28', () => {
  /**
   * Test that progression logic correctly calculates next weights for Bench Press and Barbell Row
   * after a successful workout, matching the exact scenario from issue #28.
   * 
   * This test verifies the core logic that finishWorkout uses. If finishWorkout uses stale state,
   * it would use incorrect currentWeights/exerciseAttempts values, which would cause incorrect
   * progression calculations. By testing the progression logic directly, we ensure that the
   * calculations are correct when the correct state is passed.
   */
  it('should calculate correct weight progression for Bench Press and Barbell Row (Issue #28 scenario)', () => {
    // Simulate the scenario from issue #28:
    // User completed a workout at 40kg for Bench Press and Barbell Row (both successful 5x5)
    // Both exercises were on attempt 2 (should progress after completion)
    // Weights should progress to 42.5kg, NOT reset to 20kg and 30kg (defaults)

    const user: UserProfile = {
      currentWeights: {
        'Squat': 40,
        'Bench Press': 40, // Should progress to 42.5 after successful workout
        'Barbell Row': 40, // Should progress to 42.5 after successful workout
        'Overhead Press': 30,
        'Deadlift': 60
      },
      nextWorkout: 'A',
      history: [],
      unit: 'kg',
      exerciseAttempts: {
        'Bench Press': 2, // 2nd attempt - should progress after completion
        'Barbell Row': 2, // 2nd attempt - should progress after completion
        'Squat': 1,
      },
      repeatCount: {
        'Squat': 2,
        'Bench Press': 2,
        'Barbell Row': 2,
        'Overhead Press': 2,
        'Deadlift': 2,
      },
      weightIncrements: {
        'Squat': 2.5,
        'Bench Press': 2.5,
        'Barbell Row': 2.5,
        'Overhead Press': 2.5,
        'Deadlift': 5,
      },
    };

    // Simulate Bench Press exercise from completed workout
    const benchPressExercise: ExerciseSession = {
      name: 'Bench Press',
      weight: 40,
      sets: [5, 5, 5, 5, 5], // All sets completed (successful workout)
      attempt: 2, // 2nd attempt (matches repeatCount, should progress)
    };

    // Simulate Barbell Row exercise from completed workout
    const barbellRowExercise: ExerciseSession = {
      name: 'Barbell Row',
      weight: 40,
      sets: [5, 5, 5, 5, 5], // All sets completed (successful workout)
      attempt: 2, // 2nd attempt (matches repeatCount, should progress)
    };

    // Calculate progression for Bench Press
    const benchPressProgression = calculateProgression(benchPressExercise, user);
    
    // Verify Bench Press progresses correctly (not reset to default 20kg)
    expect(benchPressProgression.nextWeight).toBe(42.5); // 40 + 2.5 = 42.5 (NOT 20)
    expect(benchPressProgression.nextAttempt).toBe(1); // Reset to 1st attempt at new weight
    expect(benchPressProgression.nextConsecutiveFailures).toBe(0); // Reset failures on success

    // Calculate progression for Barbell Row
    const barbellRowProgression = calculateProgression(barbellRowExercise, user);
    
    // Verify Barbell Row progresses correctly (not reset to default 30kg)
    expect(barbellRowProgression.nextWeight).toBe(42.5); // 40 + 2.5 = 42.5 (NOT 30)
    expect(barbellRowProgression.nextAttempt).toBe(1); // Reset to 1st attempt at new weight
    expect(barbellRowProgression.nextConsecutiveFailures).toBe(0); // Reset failures on success
  });

  /**
   * Test that progression logic works correctly when using current state values.
   * 
   * This test ensures that if finishWorkout correctly uses the latest state (via functional setState),
   * the progression calculations will be correct. This complements the fix by verifying the logic
   * works correctly when state is up-to-date.
   */
  it('should maintain correct progression when state is up-to-date', () => {
    // Simulate a scenario where weights have already progressed
    const user: UserProfile = {
      currentWeights: {
        'Bench Press': 42.5, // Already progressed from 40kg
        'Barbell Row': 42.5, // Already progressed from 40kg
      },
      nextWorkout: 'B',
      history: [],
      unit: 'kg',
      exerciseAttempts: {
        'Bench Press': 1, // First attempt at new weight
        'Barbell Row': 1, // First attempt at new weight
      },
      repeatCount: {
        'Bench Press': 2,
        'Barbell Row': 2,
      },
      weightIncrements: {
        'Bench Press': 2.5,
        'Barbell Row': 2.5,
      },
    };

    // Simulate completing another workout at the progressed weight
    const benchPressExercise: ExerciseSession = {
      name: 'Bench Press',
      weight: 42.5, // Current weight (not reset)
      sets: [5, 5, 5, 5, 5],
      attempt: 1, // First attempt at this weight
    };

    const progression = calculateProgression(benchPressExercise, user);
    
    // Should increment attempt, not progress weight yet (need 2 attempts)
    expect(progression.nextWeight).toBe(42.5); // Same weight
    expect(progression.nextAttempt).toBe(2); // Increment to 2nd attempt
    expect(progression.nextConsecutiveFailures).toBe(0);
  });
});
