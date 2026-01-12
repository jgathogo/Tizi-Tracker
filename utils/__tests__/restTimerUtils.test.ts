import { describe, it, expect } from 'vitest';
import { calculateRestDuration } from '../restTimerUtils';

describe('calculateRestDuration', () => {
  it('should return 90 seconds for successful set (5 reps)', () => {
    expect(calculateRestDuration(5)).toBe(90);
  });

  it('should return 180 seconds for failed set (0 reps)', () => {
    expect(calculateRestDuration(0)).toBe(180);
  });

  it('should return 108 seconds for 4 reps', () => {
    expect(calculateRestDuration(4)).toBe(108); // 90 + (5-4)*18 = 108
  });

  it('should return 126 seconds for 3 reps', () => {
    expect(calculateRestDuration(3)).toBe(126); // 90 + (5-3)*18 = 126
  });

  it('should return 144 seconds for 2 reps', () => {
    expect(calculateRestDuration(2)).toBe(144); // 90 + (5-2)*18 = 144
  });

  it('should return 162 seconds for 1 rep', () => {
    expect(calculateRestDuration(1)).toBe(162); // 90 + (5-1)*18 = 162
  });

  it('should handle edge cases', () => {
    // More than 5 reps (shouldn't happen in practice, but handle gracefully)
    expect(calculateRestDuration(6)).toBe(72); // 90 + (5-6)*18 = 72
    
    // Negative reps (shouldn't happen, but handle gracefully)
    expect(calculateRestDuration(-1)).toBe(198); // 90 + (5-(-1))*18 = 198
  });
});
