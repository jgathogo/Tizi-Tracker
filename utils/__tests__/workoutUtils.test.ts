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
  // Helper to get today's date normalized to midnight
  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Helper to calculate days difference between two dates
  const daysDiff = (date1: Date, date2: Date) => {
    return Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
  };

  it('should return tomorrow when no schedule is provided', () => {
    const result = getNextWorkoutDate();
    const today = getToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Should be exactly 1 day from today
    const diff = daysDiff(result, today);
    expect(diff).toBe(1);
  });

  it('should return today if it is a preferred day and no last workout', () => {
    const schedule: WorkoutSchedule = {
      frequency: 3,
      preferredDays: [new Date().getDay()], // Today's day of week
      flexible: true,
    };

    const result = getNextWorkoutDate(schedule);
    const today = getToday();
    
    // Should be today (0 days difference)
    const diff = daysDiff(result, today);
    expect(diff).toBe(0);
  });

  it('should return next preferred day if today is not preferred', () => {
    const today = getToday();
    const todayDay = today.getDay();
    
    // Find a day that's not today (prefer next day, or day after)
    const nextDay = (todayDay + 1) % 7;
    const dayAfter = (todayDay + 2) % 7;
    
    const schedule: WorkoutSchedule = {
      frequency: 3,
      preferredDays: [nextDay, dayAfter], // Next day and day after (not today)
      flexible: true,
    };

    const result = getNextWorkoutDate(schedule);
    
    // Should be 1-2 days from today
    const diff = daysDiff(result, today);
    expect(diff).toBeGreaterThanOrEqual(1);
    expect(diff).toBeLessThanOrEqual(2);
    // Should be one of the preferred days
    expect(schedule.preferredDays).toContain(result.getDay());
  });

  it('should respect minimum rest days for 3x/week schedule', () => {
    const schedule: WorkoutSchedule = {
      frequency: 3, // Minimum 1 day rest
      preferredDays: [new Date().getDay()], // Today is preferred
      flexible: true,
    };

    // Last workout was yesterday
    const yesterday = getToday();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = getNextWorkoutDate(schedule, yesterday);

    const today = getToday();
    // Should allow workout today (0 days) or tomorrow (1 day) since 1 day has passed
    const diff = daysDiff(result, today);
    expect(diff).toBeGreaterThanOrEqual(0);
    expect(diff).toBeLessThanOrEqual(1);
  });

  it('should respect minimum rest days for 2x/week schedule', () => {
    const today = getToday();
    const todayDay = today.getDay();
    const dayAfterTomorrow = (todayDay + 2) % 7;
    
    const schedule: WorkoutSchedule = {
      frequency: 2, // Minimum 2 days rest
      preferredDays: [dayAfterTomorrow],
      flexible: true,
    };

    // Last workout was yesterday
    const yesterday = getToday();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = getNextWorkoutDate(schedule, yesterday);

    // Should be at least 2 days from yesterday (which means at least 1 day from today)
    const diff = daysDiff(result, today);
    expect(diff).toBeGreaterThanOrEqual(1);
  });

  it('should return tomorrow if workout was done today', () => {
    const today = getToday();
    const todayDay = today.getDay();
    const tomorrowDay = (todayDay + 1) % 7;
    
    const schedule: WorkoutSchedule = {
      frequency: 3,
      preferredDays: [todayDay, tomorrowDay], // Today and tomorrow are preferred
      flexible: true,
    };

    // Last workout was today
    const lastWorkoutDate = getToday();
    const result = getNextWorkoutDate(schedule, lastWorkoutDate);

    // Should be tomorrow (1 day from today)
    const diff = daysDiff(result, today);
    expect(diff).toBe(1);
  });

  it('should find next preferred day in strict mode', () => {
    const today = getToday();
    const todayDay = today.getDay();
    
    // Find a preferred day that's not today (next day or later)
    const nextPreferredDay = (todayDay + 1) % 7;
    
    const schedule: WorkoutSchedule = {
      frequency: 3,
      preferredDays: [nextPreferredDay], // Only next day is preferred (not today)
      flexible: false, // Strict mode
    };

    // Last workout was 3 days ago (enough rest)
    const lastWorkoutDate = getToday();
    lastWorkoutDate.setDate(lastWorkoutDate.getDate() - 3);
    
    const result = getNextWorkoutDate(schedule, lastWorkoutDate);

    // Should be the next preferred day
    expect(result.getDay()).toBe(nextPreferredDay);
    // Should be 1-7 days from today
    const diff = daysDiff(result, today);
    expect(diff).toBeGreaterThanOrEqual(1);
    expect(diff).toBeLessThanOrEqual(7);
  });

  it('should handle empty preferred days array (any day)', () => {
    const schedule: WorkoutSchedule = {
      frequency: 3,
      preferredDays: [],
      flexible: true,
    };

    // Last workout was yesterday
    const yesterday = getToday();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = getNextWorkoutDate(schedule, yesterday);

    const today = getToday();
    // Should be today or tomorrow (enough rest, no preferred days restriction)
    const diff = daysDiff(result, today);
    expect(diff).toBeGreaterThanOrEqual(0);
    expect(diff).toBeLessThanOrEqual(1);
  });

  it('should respect minimum wait even in flexible mode', () => {
    const schedule: WorkoutSchedule = {
      frequency: 1, // Minimum 3 days rest
      preferredDays: [new Date().getDay()], // Today is preferred
      flexible: true,
    };

    // Last workout was today
    const lastWorkoutDate = getToday();
    const result = getNextWorkoutDate(schedule, lastWorkoutDate);
    
    // Should be at least 3 days from now
    const today = getToday();
    const diff = daysDiff(result, today);
    expect(diff).toBeGreaterThanOrEqual(3);
  });
});
