import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import type { Theme } from '../App';

interface WorkoutTimerProps {
  startTime: number;
  theme?: Theme;
}

/**
 * WorkoutTimer component that displays the elapsed time since workout started
 * 
 * Updates every second to show the current duration in HH:MM:SS format
 * 
 * @param startTime - Timestamp when the workout started (Date.now())
 * @param theme - Current theme ('light' | 'dark')
 */
export const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ startTime, theme = 'dark' }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    // Calculate initial elapsed time
    const updateElapsed = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedSeconds(elapsed);
    };

    // Update immediately
    updateElapsed();

    // Update every second
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  /**
   * Formats seconds into HH:MM:SS format
   */
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 text-base-content/80">
      <Clock size={16} className="text-base-content/60" />
      <span className="font-mono font-semibold text-lg">
        {formatDuration(elapsedSeconds)}
      </span>
    </div>
  );
};
