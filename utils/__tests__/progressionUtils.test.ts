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
  });
});
