import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { RestTimer } from '../RestTimer';
import * as audioUtils from '../../utils/audioUtils';

// Mock audio utilities
vi.mock('../../utils/audioUtils', () => ({
  playBellSound: vi.fn(),
  playBeepSound: vi.fn(),
  isAudioAvailable: vi.fn(() => true),
}));

describe('RestTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not render when inactive and at initial state', () => {
    const { container } = render(<RestTimer initialSeconds={90} autoStart={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when autoStart is true', () => {
    render(<RestTimer initialSeconds={90} autoStart={true} />);
    expect(screen.getByText(/Rest Timer/i)).toBeInTheDocument();
    expect(screen.getByText(/1:30/)).toBeInTheDocument(); // 90 seconds = 1:30
  });

  it('should start counting down when active', () => {
    render(<RestTimer initialSeconds={5} autoStart={true} />);
    
    expect(screen.getByText(/0:05/)).toBeInTheDocument();
    
    // Advance time by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/0:04/)).toBeInTheDocument();
    
    // Advance time by 2 more seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText(/0:02/)).toBeInTheDocument();
  });

  it('should pause when pause button is clicked', () => {
    render(<RestTimer initialSeconds={10} autoStart={true} />);
    
    const pauseButton = screen.getByText(/Pause/i);
    fireEvent.click(pauseButton);
    
    // Advance time - timer should not count down
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText(/0:10/)).toBeInTheDocument();
    
    // Resume should work
    const resumeButton = screen.getByText(/Resume/i);
    fireEvent.click(resumeButton);
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/0:09/)).toBeInTheDocument();
  });

  it('should reset to initial seconds when reset button is clicked', () => {
    const { container } = render(<RestTimer initialSeconds={90} autoStart={true} />);
    
    // Let it count down a bit
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText(/1:25/)).toBeInTheDocument();
    
    // Find the reset button (the button with RefreshCw icon, not the pause/resume button)
    const buttons = container.querySelectorAll('button');
    const resetBtn = Array.from(buttons).find(btn => {
      const svg = btn.querySelector('svg');
      const hasText = btn.textContent?.includes('Pause') || btn.textContent?.includes('Resume');
      return svg && !hasText && btn.parentElement?.querySelector('.flex.gap-2');
    });
    
    expect(resetBtn).toBeDefined();
    if (resetBtn) {
      fireEvent.click(resetBtn);
      // After reset, timer should be at initial seconds (but might be paused)
      // The timer should show 1:30 when we resume it
      const resumeButton = screen.getByText(/Resume/i);
      fireEvent.click(resumeButton);
      expect(screen.getByText(/1:30/)).toBeInTheDocument();
    }
  });

  it('should add 10 seconds when +10s button is clicked', () => {
    render(<RestTimer initialSeconds={60} autoStart={true} />);
    
    const addButton = screen.getByText(/\+10s/i);
    fireEvent.click(addButton);
    
    expect(screen.getByText(/1:10/)).toBeInTheDocument();
  });

  it('should subtract 10 seconds when -10s button is clicked', () => {
    render(<RestTimer initialSeconds={60} autoStart={true} />);
    
    const subButton = screen.getByText(/-10s/i);
    fireEvent.click(subButton);
    
    expect(screen.getByText(/0:50/)).toBeInTheDocument();
  });

  it('should allow negative seconds (overrun)', () => {
    render(<RestTimer initialSeconds={5} autoStart={true} />);
    
    const subButton = screen.getByText(/-10s/i);
    fireEvent.click(subButton);
    
    // Should show negative time: -0:05
    expect(screen.getByText(/-0:05/)).toBeInTheDocument();
  });

  it('should minimize when minimize button is clicked', () => {
    render(<RestTimer initialSeconds={90} autoStart={true} />);
    
    const minimizeButton = screen.getByText(/_/i);
    fireEvent.click(minimizeButton);
    
    // Should still show time in minimized view
    expect(screen.getByText(/1:30/)).toBeInTheDocument();
  });

  it('should update duration when initialSeconds prop changes', () => {
    const { rerender } = render(<RestTimer initialSeconds={90} autoStart={true} />);
    expect(screen.getByText(/1:30/)).toBeInTheDocument();
    
    rerender(<RestTimer initialSeconds={45} autoStart={true} />);
    expect(screen.getByText(/0:45/)).toBeInTheDocument();
  });

  it('should call onComplete when timer reaches 0 and continue counting', () => {
    const onComplete = vi.fn();
    render(<RestTimer initialSeconds={2} autoStart={true} onComplete={onComplete} />);
    
    // Advance time to 0 (this triggers the interval callbacks)
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    // Advance a bit more to allow setTimeout to fire
    act(() => {
      vi.advanceTimersByTime(10);
    });
    
    expect(onComplete).toHaveBeenCalledTimes(1);
    
    // Continue advancing - timer should keep counting into negative
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    // Should show negative time: -0:05
    expect(screen.getByText(/-0:05/)).toBeInTheDocument();
    
    // onComplete should only be called once
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should format time correctly for various durations', () => {
    const { rerender } = render(<RestTimer initialSeconds={0} autoStart={true} />);
    expect(screen.getByText(/0:00/)).toBeInTheDocument();
    
    rerender(<RestTimer initialSeconds={5} autoStart={true} />);
    expect(screen.getByText(/0:05/)).toBeInTheDocument();
    
    rerender(<RestTimer initialSeconds={65} autoStart={true} />);
    expect(screen.getByText(/1:05/)).toBeInTheDocument();
    
    rerender(<RestTimer initialSeconds={125} autoStart={true} />);
    expect(screen.getByText(/2:05/)).toBeInTheDocument();
  });

  it('should continue counting after reaching zero (overrun)', () => {
    render(<RestTimer initialSeconds={3} autoStart={true} />);
    
    // Advance to zero
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText(/0:00/)).toBeInTheDocument();
    
    // Continue advancing - should go negative
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText(/-0:05/)).toBeInTheDocument();
    
    // Continue further
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByText(/-0:15/)).toBeInTheDocument();
  });

  it('should format negative time correctly', () => {
    render(<RestTimer initialSeconds={5} autoStart={true} />);
    
    // Pause first to prevent counting
    const pauseButton = screen.getByText(/Pause/i);
    fireEvent.click(pauseButton);
    
    // Manually set to negative by subtracting
    const subButton = screen.getByText(/-10s/i);
    fireEvent.click(subButton);
    
    // Should show -0:05
    expect(screen.getByText(/-0:05/)).toBeInTheDocument();
    
    // Subtract more
    fireEvent.click(subButton);
    expect(screen.getByText(/-0:15/)).toBeInTheDocument();
  });

  it('should show error color when in overrun (negative time)', () => {
    const { container } = render(<RestTimer initialSeconds={5} autoStart={true} />);
    
    // Set to negative by subtracting
    const subButton = screen.getByText(/-10s/i);
    fireEvent.click(subButton);
    
    // Find the timer display element
    const timerDisplay = container.querySelector('.text-5xl');
    expect(timerDisplay?.className).toContain('text-error');
  });

  it('should show warning color when exactly at zero', () => {
    const { container } = render(<RestTimer initialSeconds={0} autoStart={true} />);
    
    // Find the timer display element
    const timerDisplay = container.querySelector('.text-5xl');
    expect(timerDisplay?.className).toContain('text-warning');
  });

  it('should show base-content color during countdown (positive time)', () => {
    const { container } = render(<RestTimer initialSeconds={10} autoStart={true} />);
    
    // Find the timer display element
    const timerDisplay = container.querySelector('.text-5xl');
    expect(timerDisplay?.className).toContain('text-base-content');
  });

  it('should format negative time with minutes correctly', () => {
    render(<RestTimer initialSeconds={65} autoStart={true} />);
    
    // Subtract enough to go negative with minutes
    const subButton = screen.getByText(/-10s/i);
    // Subtract 70 seconds to get -0:05
    for (let i = 0; i < 7; i++) {
      fireEvent.click(subButton);
    }
    
    // Should show negative time (e.g., -0:05)
    const timerText = screen.getByText(/-0:05/);
    expect(timerText).toBeInTheDocument();
  });

  it('should play bell sound when timer reaches 0', () => {
    render(<RestTimer initialSeconds={2} autoStart={true} />);
    
    // Advance time to 0
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    // Advance a bit more to allow setTimeout to fire
    act(() => {
      vi.advanceTimersByTime(10);
    });
    
    expect(audioUtils.playBellSound).toHaveBeenCalledTimes(1);
  });

  it('should not play bell sound when muted', () => {
    render(<RestTimer initialSeconds={2} autoStart={true} />);
    
    // Mute the timer
    const muteButton = screen.getByTitle(/mute alerts/i);
    fireEvent.click(muteButton);
    
    // Advance time to 0
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    act(() => {
      vi.advanceTimersByTime(10);
    });
    
    // Bell should not be played when muted
    expect(audioUtils.playBellSound).not.toHaveBeenCalled();
  });

  it('should toggle mute state when mute button is clicked', () => {
    render(<RestTimer initialSeconds={90} autoStart={true} />);
    
    // Initially unmuted (Volume2 icon should be visible)
    const muteButton = screen.getByTitle(/mute alerts/i);
    expect(muteButton.querySelector('svg')).toBeInTheDocument();
    
    // Click to mute
    fireEvent.click(muteButton);
    expect(screen.getByTitle(/unmute alerts/i)).toBeInTheDocument();
    
    // Click to unmute
    fireEvent.click(screen.getByTitle(/unmute alerts/i));
    expect(screen.getByTitle(/mute alerts/i)).toBeInTheDocument();
  });

  it('should play beep sound at 30-second intervals when interval alerts are enabled', () => {
    render(<RestTimer initialSeconds={90} autoStart={true} />);
    
    // Enable interval alerts
    const intervalButton = screen.getByText(/Interval Alerts Off/i);
    fireEvent.click(intervalButton);
    expect(screen.getByText(/Interval Alerts On/i)).toBeInTheDocument();
    
    // Advance to 60 seconds (should trigger beep at 60s and 30s)
    act(() => {
      vi.advanceTimersByTime(30000); // 30 seconds
    });
    expect(audioUtils.playBeepSound).toHaveBeenCalledTimes(1);
    
    act(() => {
      vi.advanceTimersByTime(30000); // Another 30 seconds (now at 30s remaining)
    });
    expect(audioUtils.playBeepSound).toHaveBeenCalledTimes(2);
  });

  it('should not play beep sound when interval alerts are disabled', () => {
    render(<RestTimer initialSeconds={90} autoStart={true} />);
    
    // Don't enable interval alerts
    
    // Advance to 60 seconds
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    
    // Beep should not be played
    expect(audioUtils.playBeepSound).not.toHaveBeenCalled();
  });

  it('should not play beep sound when muted even if interval alerts are enabled', () => {
    render(<RestTimer initialSeconds={90} autoStart={true} />);
    
    // Enable interval alerts
    const intervalButton = screen.getByText(/Interval Alerts Off/i);
    fireEvent.click(intervalButton);
    
    // Mute the timer
    const muteButton = screen.getByTitle(/mute alerts/i);
    fireEvent.click(muteButton);
    
    // Advance to 60 seconds
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    
    // Beep should not be played when muted
    expect(audioUtils.playBeepSound).not.toHaveBeenCalled();
  });

  it('should only play beep once per 30-second interval', () => {
    render(<RestTimer initialSeconds={90} autoStart={true} />);
    
    // Enable interval alerts
    const intervalButton = screen.getByText(/Interval Alerts Off/i);
    fireEvent.click(intervalButton);
    
    // Advance to 60 seconds (30 seconds elapsed)
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    expect(audioUtils.playBeepSound).toHaveBeenCalledTimes(1);
    
    // Advance 1 more second (should not trigger another beep)
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(audioUtils.playBeepSound).toHaveBeenCalledTimes(1);
    
    // Advance to next 30-second mark (29 seconds remaining)
    act(() => {
      vi.advanceTimersByTime(29000);
    });
    expect(audioUtils.playBeepSound).toHaveBeenCalledTimes(2);
  });

  it('should toggle between floating and docked modes', () => {
    render(<RestTimer initialSeconds={90} autoStart={true} />);
    
    // Initially in floating mode (should have rounded corners)
    const floatingContainer = screen.getByText(/Rest Timer/i).closest('.rounded-2xl');
    expect(floatingContainer).toBeInTheDocument();
    
    // Find dock button (Minimize2 icon)
    const dockButton = screen.getByTitle(/Dock/i);
    fireEvent.click(dockButton);
    
    // Should now be in docked mode (slim bar, uses base-200 background)
    const dockedContainer = screen.getByText(/Rest Timer/i).closest('.bg-base-200');
    expect(dockedContainer).toBeInTheDocument();
    expect(dockedContainer).not.toHaveClass('rounded-2xl');
  });

  it('should display docked bar at bottom when docked', () => {
    render(<RestTimer initialSeconds={90} autoStart={true} />);
    
    // Switch to docked mode
    const dockButton = screen.getByTitle(/Dock/i);
    fireEvent.click(dockButton);
    
    // Should be positioned at bottom
    const dockedTimer = screen.getByText(/Rest Timer/i).closest('.fixed');
    expect(dockedTimer?.className).toContain('bottom-20');
  });

  it('should show compact controls in docked mode', () => {
    render(<RestTimer initialSeconds={90} autoStart={true} />);
    
    // Switch to docked mode
    const dockButton = screen.getByTitle(/Dock/i);
    fireEvent.click(dockButton);
    
    // Should show timer display
    expect(screen.getByText(/1:30/)).toBeInTheDocument();
    
    // Should show pause/resume button
    expect(screen.getByText(/Pause/i)).toBeInTheDocument();
  });

  it('should allow undocking from docked mode', () => {
    render(<RestTimer initialSeconds={90} autoStart={true} />);
    
    // Switch to docked mode
    const dockButton = screen.getByTitle(/Dock/i);
    fireEvent.click(dockButton);
    
    // Should be in docked mode
    const dockedContainer = screen.getByText(/Rest Timer/i).closest('.bg-base-200');
    expect(dockedContainer).toBeInTheDocument();
    
    // Undock
    const undockButton = screen.getByTitle(/Undock/i);
    fireEvent.click(undockButton);
    
    // Should be back in floating mode
    const floatingContainer = screen.getByText(/Rest Timer/i).closest('.rounded-2xl');
    expect(floatingContainer).toBeInTheDocument();
  });

  it('should minimize in docked mode', () => {
    render(<RestTimer initialSeconds={90} autoStart={true} />);
    
    // Switch to docked mode
    const dockButton = screen.getByTitle(/Dock/i);
    fireEvent.click(dockButton);
    
    // Minimize
    const minimizeButton = screen.getByTitle(/Minimize/i);
    fireEvent.click(minimizeButton);
    
    // Should still show timer (minimized in docked mode shows less controls)
    expect(screen.getByText(/1:30/)).toBeInTheDocument();
  });
});
