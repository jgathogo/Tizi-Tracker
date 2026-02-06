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
import { render, screen } from '@testing-library/react';
import { UserProfile, ExerciseSession, WorkoutSessionData } from './types';
import { calculateProgression } from './utils/progressionUtils';
import App from './App';

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

describe('Dashboard Rendering', () => {
  /**
   * Test that the dashboard renders correctly with workout history.
   * This catches bugs like undefined variables in renderDashboard().
   * 
   * Issue: After refactoring renderDashboard() to fix issue #33, the recentWorkout
   * variable was not defined, causing a ReferenceError when the dashboard tried to
   * render the "Recent Workout" card.
   */
  it('should render dashboard without errors when history exists', () => {
    // Mock localStorage to return user data with history
    const mockUser: UserProfile = {
      currentWeights: {
        'Squat': 40,
        'Bench Press': 40,
        'Barbell Row': 40,
        'Overhead Press': 30,
        'Deadlift': 50
      },
      nextWorkout: 'A',
      history: [
        {
          id: '1',
          date: new Date().toISOString(),
          type: 'A',
          exercises: [
            { name: 'Squat', weight: 40, sets: [5, 5, 5, 5, 5], attempt: 1 },
            { name: 'Bench Press', weight: 40, sets: [5, 5, 5, 5, 5], attempt: 1 },
            { name: 'Barbell Row', weight: 40, sets: [5, 5, 5, 5, 5], attempt: 1 }
          ],
          completed: true,
          startTime: Date.now() - 3600000,
          endTime: Date.now() - 3000000
        } as WorkoutSessionData
      ],
      unit: 'kg',
      repeatCount: {
        'Squat': 2,
        'Bench Press': 2,
        'Barbell Row': 2,
        'Overhead Press': 2,
        'Deadlift': 2
      },
      weightIncrements: {
        'Squat': 2.5,
        'Bench Press': 2.5,
        'Barbell Row': 2.5,
        'Overhead Press': 2.5,
        'Deadlift': 5
      }
    };

    localStorage.setItem('tizi_tracker_data', JSON.stringify(mockUser));

    // Render App - should not throw
    expect(() => {
      render(<App />);
    }).not.toThrow();

    // Should render dashboard elements
    expect(screen.getByText(/Tizi Tracker/i)).toBeInTheDocument();
  });

  it('should render dashboard without errors when no history exists', () => {
    // Mock localStorage with empty history
    const mockUser: UserProfile = {
      currentWeights: {
        'Squat': 20,
        'Bench Press': 20,
        'Barbell Row': 30,
        'Overhead Press': 20,
        'Deadlift': 40
      },
      nextWorkout: 'A',
      history: [],
      unit: 'kg'
    };

    localStorage.setItem('tizi_tracker_data', JSON.stringify(mockUser));

    // Render App - should not throw even with no history
    expect(() => {
      render(<App />);
    }).not.toThrow();

    // Should still render dashboard
    expect(screen.getByText(/Tizi Tracker/i)).toBeInTheDocument();
  });

  /**
   * Regression test: ensure next Workout B preview pulls weights from the most recent
   * occurrence of each exercise across ALL history, not just the latest workout.
   *
   * Scenario (similar to the screenshots):
   * - Most recent workout is A (Squat / Bench / Row)
   * - Previous workout is B (Squat / Overhead Press / Deadlift)
   * - currentWeights have OHP / Deadlift at initial values, but history shows higher.
   *
   * Expectation:
   * - Overhead Press shows 40kg (failed sets, so retry same weight)
   * - Deadlift shows 55kg (50kg all 5s on attempt 2/2, so progress by 5kg)
   */
  it('should derive next Workout B weights from full A/B history', () => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const workoutBDate = new Date(now - 3 * dayMs).toISOString();
    const workoutADate = new Date(now - 1 * dayMs).toISOString();

    const mockUser: UserProfile = {
      currentWeights: {
        // Deliberately wrong / initial values – should be corrected from history
        'Squat': 20,
        'Bench Press': 20,
        'Barbell Row': 30,
        'Overhead Press': 20,
        'Deadlift': 40
      },
      nextWorkout: 'B',
      history: [
        // Most recent workout: A
        {
          id: '2',
          date: workoutADate,
          type: 'A',
          exercises: [
            { name: 'Squat', weight: 60, sets: [5, 5, 5, 5, 5], attempt: 2 },
            { name: 'Bench Press', weight: 40, sets: [5, 5, 5, 5, 5], attempt: 2 },
            { name: 'Barbell Row', weight: 40, sets: [5, 5, 5, 5, 5], attempt: 2 }
          ],
          completed: true,
          startTime: now - 3600000,
          endTime: now - 3000000,
          notes: ''
        } as WorkoutSessionData,
        // Previous workout: B (contains OHP / Deadlift)
        {
          id: '1',
          date: workoutBDate,
          type: 'B',
          exercises: [
            { name: 'Squat', weight: 60, sets: [5, 5, 5, 5, 5], attempt: 1 },
            { name: 'Overhead Press', weight: 40, sets: [5, 3, 5, 1, 1], attempt: 1 },
            { name: 'Deadlift', weight: 50, sets: [5, 5, 5, 5, 5], attempt: 2 }
          ],
          completed: true,
          startTime: now - 7200000,
          endTime: now - 6600000,
          notes: ''
        } as WorkoutSessionData
      ],
      unit: 'kg',
      repeatCount: {
        'Squat': 2,
        'Bench Press': 2,
        'Barbell Row': 2,
        'Overhead Press': 2,
        'Deadlift': 2
      },
      weightIncrements: {
        'Squat': 2.5,
        'Bench Press': 2.5,
        'Barbell Row': 2.5,
        'Overhead Press': 2.5,
        'Deadlift': 5
      }
    };

    localStorage.setItem('tizi_tracker_data', JSON.stringify(mockUser));

    render(<App />);

    // Quick Start card should show Workout B with the derived weights
    expect(screen.getByText(/Workout B/i)).toBeInTheDocument();
    expect(screen.getByText(/Overhead Press - 40kg/i)).toBeInTheDocument();
    expect(screen.getByText(/Deadlift - 55kg/i)).toBeInTheDocument();
  });
});
