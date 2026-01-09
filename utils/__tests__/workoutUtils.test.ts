import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calculateCalories, getNextWorkoutDate } from '../workoutUtils';
import { WorkoutSessionData, WorkoutSchedule } from '../../types';

describe('calculateCalories', () => {
  it('should calculate calories for a workout with duration', () => {
    const workout: WorkoutSessionData = {
      id: '1',
      date: '2026-01-09',
      type: 'A',
      exercises: [
        {
          name: 'Squat',
          weight: 100,
          sets: [5, 5, 5, 5, 5],
        },
        {
          name: 'Bench Press',
          weight: 80,
          sets: [5, 5, 5, 5, 5],
        },
      ],
      notes: '',
      completed: true,
      startTime: 1000000,
      endTime: 1000000 + (45 * 60 * 1000), // 45 minutes
    };

    // Total volume: (100 * 25) + (80 * 25) = 4500 kg
    // Base calories: 45 * 5 = 225
    // Volume calories: 4500 * 0.1 = 450
    // Total: 675 calories
    const result = calculateCalories(workout, 'kg');
    expect(result).toBe(675);
  });

  it('should use default duration when endTime is missing', () => {
    const workout: WorkoutSessionData = {
      id: '1',
      date: '2026-01-09',
      type: 'A',
      exercises: [
        {
          name: 'Squat',
          weight: 100,
          sets: [5, 5, 5, 5, 5],
        },
      ],
      notes: '',
      completed: true,
      startTime: 1000000,
    };

    // Default to 30 minutes
    // Base: 30 * 5 = 150
    // Volume: (100 * 25) * 0.1 = 250
    // Total: 400
    const result = calculateCalories(workout, 'kg');
    expect(result).toBe(400);
  });

  it('should convert pounds to kilograms correctly', () => {
    const workout: WorkoutSessionData = {
      id: '1',
      date: '2026-01-09',
      type: 'A',
      exercises: [
        {
          name: 'Squat',
          weight: 220, // 220 lbs
          sets: [5, 5, 5, 5, 5],
        },
      ],
      notes: '',
      completed: true,
      startTime: 1000000,
      endTime: 1000000 + (30 * 60 * 1000),
    };

    // 220 lbs * 0.453592 = ~99.79 kg
    // Volume: (99.79 * 25) * 0.1 = ~249.5
    // Base: 30 * 5 = 150
    // Total: ~400
    const result = calculateCalories(workout, 'lb');
    expect(result).toBeGreaterThan(390);
    expect(result).toBeLessThan(410);
  });

  it('should handle incomplete sets correctly', () => {
    const workout: WorkoutSessionData = {
      id: '1',
      date: '2026-01-09',
      type: 'A',
      exercises: [
        {
          name: 'Squat',
          weight: 100,
          sets: [5, 5, 3, null, null], // Only 13 reps completed
        },
      ],
      notes: '',
      completed: true,
      startTime: 1000000,
      endTime: 1000000 + (30 * 60 * 1000),
    };

    // Volume: (100 * 13) * 0.1 = 130
    // Base: 30 * 5 = 150
    // Total: 280
    const result = calculateCalories(workout, 'kg');
    expect(result).toBe(280);
  });

  it('should handle minimum duration of 1 minute', () => {
    const workout: WorkoutSessionData = {
      id: '1',
      date: '2026-01-09',
      type: 'A',
      exercises: [
        {
          name: 'Squat',
          weight: 100,
          sets: [5, 5, 5, 5, 5],
        },
      ],
      notes: '',
      completed: true,
      startTime: 1000000,
      endTime: 1000000 + (30 * 1000), // 30 seconds, should round to 1 minute
    };

    // Base: 1 * 5 = 5 (minimum 1 minute)
    // Volume: (100 * 25) * 0.1 = 250
    // Total: 255
    const result = calculateCalories(workout, 'kg');
    expect(result).toBe(255);
  });
});

describe('getNextWorkoutDate', () => {
  const mockDate = new Date('2026-01-09T12:00:00Z'); // Thursday, January 9, 2026
  
  beforeEach(() => {
    // Mock today's date to a known value for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return tomorrow when no schedule is provided', () => {
    const result = getNextWorkoutDate();
    const today = new Date('2026-01-09T12:00:00Z');
    const expected = new Date(today);
    expected.setDate(expected.getDate() + 1);
    expect(result.getDate()).toBe(expected.getDate());
    expect(result.getMonth()).toBe(expected.getMonth());
    expect(result.getFullYear()).toBe(expected.getFullYear());
  });

  it('should return today if it is a preferred day and no last workout', () => {
    const schedule: WorkoutSchedule = {
      frequency: 3,
      preferredDays: [4], // Thursday (today)
      flexible: true,
    };

    const result = getNextWorkoutDate(schedule);
    const today = new Date('2026-01-09T12:00:00Z');
    today.setHours(0, 0, 0, 0);
    expect(result.getDate()).toBe(today.getDate());
    expect(result.getMonth()).toBe(today.getMonth());
    expect(result.getFullYear()).toBe(today.getFullYear());
  });

  it('should return next preferred day if today is not preferred', () => {
    const schedule: WorkoutSchedule = {
      frequency: 3,
      preferredDays: [1, 3, 5], // Monday, Wednesday, Friday
      flexible: true,
    };

    const result = getNextWorkoutDate(schedule);
    // Thursday -> Next preferred day is Friday (day 5)
    expect(result.getDay()).toBe(5); // Friday
    expect(result.getDate()).toBe(10); // January 10
  });

  it('should respect minimum rest days for 3x/week schedule', () => {
    const schedule: WorkoutSchedule = {
      frequency: 3, // Minimum 1 day rest
      preferredDays: [1, 3, 5, 4], // Including Thursday
      flexible: true,
    };

    // Last workout was yesterday (Wednesday)
    const lastWorkoutDate = new Date('2026-01-08T12:00:00Z');
    lastWorkoutDate.setHours(0, 0, 0, 0);
    const result = getNextWorkoutDate(schedule, lastWorkoutDate);

    // Should allow workout today (Thursday) since 1 day has passed
    expect(result.getDay()).toBe(4); // Thursday
    expect(result.getDate()).toBe(9); // January 9
  });

  it('should respect minimum rest days for 2x/week schedule', () => {
    const schedule: WorkoutSchedule = {
      frequency: 2, // Minimum 2 days rest
      preferredDays: [1, 3, 5],
      flexible: true,
    };

    // Last workout was yesterday (Wednesday)
    const lastWorkoutDate = new Date('2026-01-08T12:00:00Z');
    lastWorkoutDate.setHours(0, 0, 0, 0);
    const result = getNextWorkoutDate(schedule, lastWorkoutDate);

    // Should be Friday (2 days after Wednesday)
    expect(result.getDay()).toBe(5); // Friday
    expect(result.getDate()).toBe(10); // January 10
  });

  it('should return tomorrow if workout was done today', () => {
    const schedule: WorkoutSchedule = {
      frequency: 3,
      preferredDays: [1, 3, 5, 4], // Including Thursday
      flexible: true,
    };

    // Last workout was today
    const lastWorkoutDate = new Date('2026-01-09T12:00:00Z');
    lastWorkoutDate.setHours(0, 0, 0, 0);

    const result = getNextWorkoutDate(schedule, lastWorkoutDate);
    expect(result.getDay()).toBe(5); // Friday (tomorrow)
    expect(result.getDate()).toBe(10); // January 10
  });

  it('should find next preferred day in strict mode', () => {
    const schedule: WorkoutSchedule = {
      frequency: 3,
      preferredDays: [1, 5], // Only Monday and Friday
      flexible: false, // Strict mode
    };

    // Today is Thursday, last workout was Monday
    const lastWorkoutDate = new Date('2026-01-05T12:00:00Z');
    lastWorkoutDate.setHours(0, 0, 0, 0);
    const result = getNextWorkoutDate(schedule, lastWorkoutDate);

    // Should be Friday (next preferred day after Thursday)
    // Since today is Thursday (day 4) and preferred days are [1, 5] (Monday, Friday)
    // Next preferred day is Friday (day 5)
    expect(result.getDay()).toBe(5); // Friday
    // Friday would be Jan 10 if today is Jan 9 (Thursday)
    const daysUntilFriday = (5 + 7 - 4) % 7 || 7; // Calculate days from Thursday to Friday = 1 day
    const expectedDate = 9 + daysUntilFriday;
    expect(result.getDate()).toBe(expectedDate);
  });

  it('should handle empty preferred days array (any day)', () => {
    const schedule: WorkoutSchedule = {
      frequency: 3,
      preferredDays: [],
      flexible: true,
    };

    // Last workout was yesterday (Wednesday, Jan 8)
    const lastWorkoutDate = new Date('2026-01-08T12:00:00Z');
    lastWorkoutDate.setHours(0, 0, 0, 0);
    const result = getNextWorkoutDate(schedule, lastWorkoutDate);

    // Should be today or tomorrow (enough rest, no preferred days restriction)
    // With 3x/week (1 day min rest), yesterday workout means today is valid
    const today = new Date(mockDate);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Result should be either today or tomorrow
    expect([today.getDate(), tomorrow.getDate()]).toContain(result.getDate());
  });

  it('should respect minimum wait even in flexible mode', () => {
    const schedule: WorkoutSchedule = {
      frequency: 1, // Minimum 3 days rest
      preferredDays: [4], // Thursday is preferred
      flexible: true,
    };

    // Last workout was today
    const lastWorkoutDate = new Date('2026-01-09T12:00:00Z');
    lastWorkoutDate.setHours(0, 0, 0, 0);

    const result = getNextWorkoutDate(schedule, lastWorkoutDate);
    
    // Should be at least 3 days from now
    const today = new Date('2026-01-09T12:00:00Z');
    const daysDiff = Math.floor((result.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    expect(daysDiff).toBeGreaterThanOrEqual(3);
  });
});
