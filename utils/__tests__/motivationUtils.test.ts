import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getMotivationSummary } from '../motivationUtils';
import { WorkoutSessionData, WorkoutSchedule } from '../../types';

function session(id: string, date: string, completed = true): WorkoutSessionData {
  return {
    id,
    date,
    type: 'A',
    exercises: [],
    notes: '',
    completed,
    startTime: 0,
  };
}

describe('getMotivationSummary', () => {
  const schedule: WorkoutSchedule = {
    frequency: 3,
    preferredDays: [1, 3, 5],
    flexible: true,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-19T12:00:00')); // Thursday
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return weekly goal from schedule', () => {
    const result = getMotivationSummary([], schedule);
    expect(result.weeklyGoal).toBe(3);
  });

  it('should default weekly goal to 3 when no schedule', () => {
    const result = getMotivationSummary([]);
    expect(result.weeklyGoal).toBe(3);
  });

  it('should count workouts this week', () => {
    const history = [
      session('1', '2026-02-17'), // Mon
      session('2', '2026-02-19'), // Thu (today)
    ];
    const result = getMotivationSummary(history, schedule);
    expect(result.workoutsThisWeek).toBe(2);
  });

  it('should set weeklyGoalMet when workoutsThisWeek >= weeklyGoal', () => {
    const history = [
      session('1', '2026-02-17'),
      session('2', '2026-02-18'),
      session('3', '2026-02-19'),
    ];
    const result = getMotivationSummary(history, schedule);
    expect(result.weeklyGoalMet).toBe(true);
  });

  it('should compute session streak for consecutive days', () => {
    const history = [
      session('1', '2026-02-19'),
      session('2', '2026-02-18'),
      session('3', '2026-02-17'),
    ];
    const result = getMotivationSummary(history, schedule);
    expect(result.sessionStreak).toBe(3);
  });

  it('should return zero session streak when no recent workout', () => {
    const history = [session('1', '2026-02-01')];
    const result = getMotivationSummary(history, schedule);
    expect(result.sessionStreak).toBe(0);
  });

  it('should ignore incomplete sessions', () => {
    const history = [
      session('1', '2026-02-19'),
      { ...session('2', '2026-02-18'), completed: false },
    ];
    const result = getMotivationSummary(history, schedule);
    expect(result.workoutsThisWeek).toBe(1);
  });
});
