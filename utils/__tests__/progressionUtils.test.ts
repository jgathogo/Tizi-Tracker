import { describe, it, expect } from 'vitest';
import { calculateProgression } from '../progressionUtils';
import { ExerciseSession, UserProfile } from '../../types';

describe('calculateProgression', () => {
  const baseUser: UserProfile = {
    currentWeights: {},
    nextWorkout: 'A',
    history: [],
    unit: 'kg',
    repeatCount: {
      'Squat': 2,
      'Bench Press': 2,
      'Deadlift': 2,
    },
    weightIncrements: {
      'Squat': 2.5,
      'Bench Press': 2.5,
      'Deadlift': 5,
    },
  };

  it('should progress weight when all sets completed and attempts >= repeatCount', () => {
    const exercise: ExerciseSession = {
      name: 'Squat',
      weight: 100,
      sets: [5, 5, 5, 5, 5],
      attempt: 2, // 2nd attempt (matches repeatCount)
    };

    const result = calculateProgression(exercise, baseUser);

    expect(result.nextWeight).toBe(102.5); // 100 + 2.5
    expect(result.nextAttempt).toBe(1); // Reset to 1st attempt
    expect(result.nextConsecutiveFailures).toBe(0); // Reset failures on success
  });

  it('should increment attempt when all sets completed but attempts < repeatCount', () => {
    const exercise: ExerciseSession = {
      name: 'Squat',
      weight: 100,
      sets: [5, 5, 5, 5, 5],
      attempt: 1, // 1st attempt (less than repeatCount of 2)
    };

    const result = calculateProgression(exercise, baseUser);

    expect(result.nextWeight).toBe(100); // Same weight
    expect(result.nextAttempt).toBe(2); // Increment attempt
    expect(result.nextConsecutiveFailures).toBe(0); // Reset failures on success
  });

  it('should keep same weight and attempt when sets not all completed', () => {
    const exercise: ExerciseSession = {
      name: 'Squat',
      weight: 100,
      sets: [5, 5, 4, 5, 5], // One set incomplete
      attempt: 1,
    };

    const result = calculateProgression(exercise, baseUser);

    expect(result.nextWeight).toBe(100); // Same weight
    expect(result.nextAttempt).toBe(1); // Same attempt
    expect(result.nextConsecutiveFailures).toBe(1); // First failure
  });

  it('should use custom weight increment per exercise', () => {
    const exercise: ExerciseSession = {
      name: 'Deadlift',
      weight: 150,
      sets: [5, 5, 5, 5, 5],
      attempt: 2,
    };

    const result = calculateProgression(exercise, baseUser);

    expect(result.nextWeight).toBe(155); // 150 + 5 (Deadlift uses 5kg increment)
    expect(result.nextAttempt).toBe(1);
    expect(result.nextConsecutiveFailures).toBe(0); // Reset failures on success
  });

  it('should use default increment when exercise not in weightIncrements', () => {
    const exercise: ExerciseSession = {
      name: 'Overhead Press',
      weight: 50,
      sets: [5, 5, 5, 5, 5],
      attempt: 2,
    };

    const result = calculateProgression(exercise, baseUser);

    // Overhead Press not in increments, should use default (2.5kg for non-Deadlift)
    expect(result.nextWeight).toBe(52.5);
    expect(result.nextAttempt).toBe(1);
    expect(result.nextConsecutiveFailures).toBe(0); // Reset failures on success
  });

  it('should use default repeatCount (2) when exercise not in repeatCount', () => {
    const exercise: ExerciseSession = {
      name: 'Overhead Press',
      weight: 50,
      sets: [5, 5, 5, 5, 5],
      attempt: 2, // Matches default repeatCount of 2
    };

    const result = calculateProgression(exercise, baseUser);

    expect(result.nextWeight).toBe(52.5); // Should progress
    expect(result.nextAttempt).toBe(1);
    expect(result.nextConsecutiveFailures).toBe(0); // Reset failures on success
  });

  it('should handle attempt 1 when attempt is undefined', () => {
    const exercise: ExerciseSession = {
      name: 'Squat',
      weight: 100,
      sets: [5, 5, 5, 5, 5],
      // attempt is undefined
    };

    const result = calculateProgression(exercise, baseUser);

    expect(result.nextWeight).toBe(100); // Should not progress yet (attempt 1 < repeatCount 2)
    expect(result.nextAttempt).toBe(2); // Should increment to 2
    expect(result.nextConsecutiveFailures).toBe(0); // Reset failures on success
  });

  it('should handle custom repeatCount per exercise', () => {
    const userWithCustomRepeat: UserProfile = {
      ...baseUser,
      repeatCount: {
        'Squat': 3, // Custom: need 3 attempts before progressing
        'Bench Press': 2,
      },
    };

    const exercise: ExerciseSession = {
      name: 'Squat',
      weight: 100,
      sets: [5, 5, 5, 5, 5],
      attempt: 2, // 2nd attempt (less than repeatCount of 3)
    };

    const result = calculateProgression(exercise, userWithCustomRepeat);

    expect(result.nextWeight).toBe(100); // Should not progress yet
    expect(result.nextAttempt).toBe(3); // Increment to 3
    expect(result.nextConsecutiveFailures).toBe(0); // Reset failures on success
  });

  it('should handle null reps in sets correctly', () => {
    const exercise: ExerciseSession = {
      name: 'Squat',
      weight: 100,
      sets: [5, 5, null, null, null], // Some sets incomplete
      attempt: 2,
    };

    const result = calculateProgression(exercise, baseUser);

    expect(result.nextWeight).toBe(100); // Should not progress (not all sets completed)
    expect(result.nextAttempt).toBe(2); // Should not increment attempt
    expect(result.nextConsecutiveFailures).toBe(1); // First failure
  });

  it('should progress when attempt exactly equals repeatCount', () => {
    const exercise: ExerciseSession = {
      name: 'Bench Press',
      weight: 80,
      sets: [5, 5, 5, 5, 5],
      attempt: 2, // Exactly equals repeatCount
    };

    const result = calculateProgression(exercise, baseUser);

    expect(result.nextWeight).toBe(82.5); // Should progress
    expect(result.nextAttempt).toBe(1); // Reset to 1
    expect(result.nextConsecutiveFailures).toBe(0); // Reset failures on success
  });

  it('should track consecutive failures when sets not completed', () => {
    const exercise: ExerciseSession = {
      name: 'Squat',
      weight: 100,
      sets: [5, 5, 4, 5, 5], // One set incomplete (failure)
      attempt: 1,
    };

    const result = calculateProgression(exercise, baseUser);

    expect(result.nextWeight).toBe(100); // Same weight
    expect(result.nextAttempt).toBe(1); // Same attempt
    expect(result.nextConsecutiveFailures).toBe(1); // First failure
    expect(result.deloadInfo).toBeUndefined(); // No deload yet
  });

  it('should increment consecutive failures on multiple failures', () => {
    const userWithFailures: UserProfile = {
      ...baseUser,
      consecutiveFailures: {
        'Squat': 1, // Already 1 failure
      },
    };

    const exercise: ExerciseSession = {
      name: 'Squat',
      weight: 100,
      sets: [5, 5, 4, 5, 5], // Failure again
      attempt: 1,
    };

    const result = calculateProgression(exercise, userWithFailures);

    expect(result.nextWeight).toBe(100); // Same weight
    expect(result.nextConsecutiveFailures).toBe(2); // Second failure
    expect(result.deloadInfo).toBeUndefined(); // No deload yet (need 3)
  });

  it('should auto-deload after 3 consecutive failures', () => {
    const userWithFailures: UserProfile = {
      ...baseUser,
      consecutiveFailures: {
        'Squat': 2, // Already 2 failures
      },
    };

    const exercise: ExerciseSession = {
      name: 'Squat',
      weight: 100,
      sets: [5, 5, 4, 5, 5], // Third failure
      attempt: 1,
    };

    const result = calculateProgression(exercise, userWithFailures);

    expect(result.nextWeight).toBe(90); // 10% deload: 100 * 0.9 = 90
    expect(result.nextAttempt).toBe(1); // Reset to 1st attempt
    expect(result.nextConsecutiveFailures).toBe(0); // Reset failures after deload
    expect(result.deloadInfo).toBeDefined();
    expect(result.deloadInfo?.oldWeight).toBe(100);
    expect(result.deloadInfo?.newWeight).toBe(90);
    expect(result.deloadInfo?.reason).toContain('Plateau detected');
  });

  it('should reset consecutive failures on successful workout', () => {
    const userWithFailures: UserProfile = {
      ...baseUser,
      consecutiveFailures: {
        'Squat': 2, // Had 2 failures
      },
    };

    const exercise: ExerciseSession = {
      name: 'Squat',
      weight: 100,
      sets: [5, 5, 5, 5, 5], // All sets completed (success)
      attempt: 1,
    };

    const result = calculateProgression(exercise, userWithFailures);

    expect(result.nextConsecutiveFailures).toBe(0); // Reset on success
    expect(result.deloadInfo).toBeUndefined(); // No deload
  });

  it('should round deloaded weight to 1 decimal place', () => {
    const userWithFailures: UserProfile = {
      ...baseUser,
      consecutiveFailures: {
        'Squat': 2,
      },
    };

    const exercise: ExerciseSession = {
      name: 'Squat',
      weight: 87.5, // Will deload to 78.75, should round to 78.8
      sets: [5, 5, 4, 5, 5],
      attempt: 1,
    };

    const result = calculateProgression(exercise, userWithFailures);

    expect(result.nextWeight).toBe(78.8); // 87.5 * 0.9 = 78.75, rounded to 78.8
  });

  it('should handle deload when failures reach exactly 3', () => {
    const userWithFailures: UserProfile = {
      ...baseUser,
      consecutiveFailures: {
        'Bench Press': 2,
      },
    };

    const exercise: ExerciseSession = {
      name: 'Bench Press',
      weight: 80,
      sets: [5, 5, 4, 5, 5], // Third failure
      attempt: 1,
    };

    const result = calculateProgression(exercise, userWithFailures);

    expect(result.nextWeight).toBe(72); // 80 * 0.9 = 72
    expect(result.nextConsecutiveFailures).toBe(0);
    expect(result.deloadInfo).toBeDefined();
  });
});
