/**
 * Tests for WorkoutTimer component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { WorkoutTimer } from '../WorkoutTimer';

describe('WorkoutTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set a fixed system time
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render elapsed time starting from 0', () => {
    const startTime = Date.now();
    render(<WorkoutTimer startTime={startTime} />);
    
    // Should show 00:00 initially (or very close to it)
    expect(screen.getByText(/00:00/)).toBeInTheDocument();
  });

  it('should update elapsed time every second', () => {
    const startTime = Date.now();
    render(<WorkoutTimer startTime={startTime} />);
    
    // Advance system time by 5 seconds and trigger interval
    act(() => {
      vi.advanceTimersByTime(5000);
      vi.setSystemTime(new Date('2024-01-01T12:00:05Z'));
    });
    
    // Should show 00:05
    expect(screen.getByText(/00:05/)).toBeInTheDocument();
  });

  it('should format time correctly for minutes and seconds', () => {
    const startTime = Date.now() - 125000; // 2 minutes 5 seconds ago
    render(<WorkoutTimer startTime={startTime} />);
    
    // Should show 02:05
    expect(screen.getByText(/02:05/)).toBeInTheDocument();
  });

  it('should format time correctly for hours, minutes and seconds', () => {
    const startTime = Date.now() - 3665000; // 1 hour 1 minute 5 seconds ago
    render(<WorkoutTimer startTime={startTime} />);
    
    // Should show 01:01:05
    expect(screen.getByText(/01:01:05/)).toBeInTheDocument();
  });

  it('should display clock icon', () => {
    const startTime = Date.now();
    const { container } = render(<WorkoutTimer startTime={startTime} />);
    
    // Check for Clock icon (lucide-react renders as SVG)
    const clockIcon = container.querySelector('svg');
    expect(clockIcon).toBeInTheDocument();
  });

  it('should use base-content colors (DaisyUI semantic)', () => {
    const startTime = Date.now();
    const { container } = render(<WorkoutTimer startTime={startTime} />);
    
    const timerElement = container.querySelector('div');
    expect(timerElement?.className).toContain('text-base-content');
  });

  it('should use same semantic classes for all themes', () => {
    const startTime = Date.now();
    const { container: darkContainer } = render(<WorkoutTimer startTime={startTime} theme="dark" />);
    const { container: lightContainer } = render(<WorkoutTimer startTime={startTime} theme="light" />);
    
    const darkElement = darkContainer.querySelector('div');
    const lightElement = lightContainer.querySelector('div');
    
    // Both should use base-content (DaisyUI adapts to theme)
    expect(darkElement?.className).toContain('text-base-content');
    expect(lightElement?.className).toContain('text-base-content');
  });

  it('should handle zero elapsed time', () => {
    const startTime = Date.now();
    render(<WorkoutTimer startTime={startTime} />);
    
    // Should show 00:00
    expect(screen.getByText(/00:00/)).toBeInTheDocument();
  });

  it('should handle very long durations (multiple hours)', () => {
    const startTime = Date.now() - 7325000; // 2 hours 2 minutes 5 seconds ago
    render(<WorkoutTimer startTime={startTime} />);
    
    // Should show 02:02:05
    expect(screen.getByText(/02:02:05/)).toBeInTheDocument();
  });

  it('should update when startTime prop changes', () => {
    const initialStartTime = Date.now() - 60000; // 1 minute ago
    const { rerender } = render(<WorkoutTimer startTime={initialStartTime} />);
    
    // Should show approximately 01:00
    expect(screen.getByText(/01:00/)).toBeInTheDocument();
    
    // Change startTime to 2 minutes ago
    const newStartTime = Date.now() - 120000;
    rerender(<WorkoutTimer startTime={newStartTime} />);
    
    // Should show approximately 02:00
    expect(screen.getByText(/02:00/)).toBeInTheDocument();
  });

  it('should pad single digit minutes and seconds with zeros', () => {
    const startTime = Date.now() - 65000; // 1 minute 5 seconds ago
    render(<WorkoutTimer startTime={startTime} />);
    
    // Should show 01:05 (not 1:5)
    expect(screen.getByText(/01:05/)).toBeInTheDocument();
  });

  it('should pad single digit hours with zeros', () => {
    const startTime = Date.now() - 3665000; // 1 hour 1 minute 5 seconds ago
    render(<WorkoutTimer startTime={startTime} />);
    
    // Should show 01:01:05 (not 1:1:5)
    expect(screen.getByText(/01:01:05/)).toBeInTheDocument();
  });

  it('should clean up interval on unmount', () => {
    const startTime = Date.now();
    const { unmount } = render(<WorkoutTimer startTime={startTime} />);
    
    // Advance system time
    act(() => {
      vi.advanceTimersByTime(5000);
      vi.setSystemTime(new Date('2024-01-01T12:00:05Z'));
    });
    expect(screen.getByText(/00:05/)).toBeInTheDocument();
    
    // Unmount should clean up
    unmount();
    
    // Verify no errors (interval should be cleared)
    // After unmount, advancing time should not cause issues
    expect(() => act(() => vi.advanceTimersByTime(1000))).not.toThrow();
  });
});
