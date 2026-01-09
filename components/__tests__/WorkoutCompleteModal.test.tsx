import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkoutCompleteModal } from '../WorkoutCompleteModal';
import { WorkoutSessionData } from '../../types';
import * as workoutUtils from '../../utils/workoutUtils';

// Mock the utility functions
vi.mock('../../utils/workoutUtils', () => ({
  calculateCalories: vi.fn(),
  getNextWorkoutDate: vi.fn(),
}));

describe('WorkoutCompleteModal', () => {
  const mockWorkout: WorkoutSessionData = {
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
    notes: 'Great workout!',
    completed: true,
    startTime: 1000000,
    endTime: 1000000 + (45 * 60 * 1000), // 45 minutes
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(workoutUtils.calculateCalories).mockReturnValue(675);
    vi.mocked(workoutUtils.getNextWorkoutDate).mockReturnValue(new Date('2026-01-12'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <WorkoutCompleteModal
        isOpen={false}
        onClose={mockOnClose}
        workout={mockWorkout}
        nextWorkout="B"
        unit="kg"
      />
    );

    expect(screen.queryByText(/Workout Complete/i)).not.toBeInTheDocument();
  });

  it('should render workout summary correctly', () => {
    render(
      <WorkoutCompleteModal
        isOpen={true}
        onClose={mockOnClose}
        workout={mockWorkout}
        nextWorkout="B"
        unit="kg"
      />
    );

    expect(screen.getByText('Workout Complete! 🎉')).toBeInTheDocument();
    expect(screen.getByText(/Workout A/i)).toBeInTheDocument();
    expect(screen.getByText(/45 minutes/i)).toBeInTheDocument();
  });

  it('should display personalized message when userName is provided', () => {
    render(
      <WorkoutCompleteModal
        isOpen={true}
        onClose={mockOnClose}
        workout={mockWorkout}
        nextWorkout="B"
        unit="kg"
        userName="John"
      />
    );

    expect(screen.getByText('Great job, John! 🎉')).toBeInTheDocument();
  });

  it('should display exercise breakdown correctly', () => {
    render(
      <WorkoutCompleteModal
        isOpen={true}
        onClose={mockOnClose}
        workout={mockWorkout}
        nextWorkout="B"
        unit="kg"
      />
    );

    expect(screen.getByText('Squat')).toBeInTheDocument();
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText(/100kg/i)).toBeInTheDocument();
    expect(screen.getByText(/80kg/i)).toBeInTheDocument();
  });

  it('should display calculated calories', () => {
    vi.mocked(workoutUtils.calculateCalories).mockReturnValue(675);

    render(
      <WorkoutCompleteModal
        isOpen={true}
        onClose={mockOnClose}
        workout={mockWorkout}
        nextWorkout="B"
        unit="kg"
      />
    );

    expect(screen.getByText('675')).toBeInTheDocument();
    expect(screen.getByText(/Calories Burnt/i)).toBeInTheDocument();
    expect(workoutUtils.calculateCalories).toHaveBeenCalledWith(mockWorkout, 'kg');
  });

  it('should display next workout date', () => {
    const nextDate = new Date('2026-01-12');
    vi.mocked(workoutUtils.getNextWorkoutDate).mockReturnValue(nextDate);

    render(
      <WorkoutCompleteModal
        isOpen={true}
        onClose={mockOnClose}
        workout={mockWorkout}
        nextWorkout="B"
        unit="kg"
      />
    );

    expect(screen.getByText('Workout B')).toBeInTheDocument();
    expect(workoutUtils.getNextWorkoutDate).toHaveBeenCalled();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <WorkoutCompleteModal
        isOpen={true}
        onClose={mockOnClose}
        workout={mockWorkout}
        nextWorkout="B"
        unit="kg"
      />
    );

    const closeButtons = screen.getAllByRole('button');
    // Find the X close button (first button, or the one in header)
    const closeButton = closeButtons.find(btn => 
      btn.querySelector('svg') || btn.textContent === ''
    ) || closeButtons[0];

    await user.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should calculate total volume correctly', () => {
    render(
      <WorkoutCompleteModal
        isOpen={true}
        onClose={mockOnClose}
        workout={mockWorkout}
        nextWorkout="B"
        unit="kg"
      />
    );

    // Total volume: (100 * 25) + (80 * 25) = 4500
    expect(screen.getByText(/4,500 kg/i)).toBeInTheDocument();
  });

  it('should handle workouts with incomplete sets', () => {
    const workoutWithIncompleteSets: WorkoutSessionData = {
      ...mockWorkout,
      exercises: [
        {
          name: 'Squat',
          weight: 100,
          sets: [5, 5, 3, null, null], // Incomplete sets
        },
      ],
    };

    render(
      <WorkoutCompleteModal
        isOpen={true}
        onClose={mockOnClose}
        workout={workoutWithIncompleteSets}
        nextWorkout="B"
        unit="kg"
      />
    );

    expect(screen.getByText('Squat')).toBeInTheDocument();
    expect(screen.getByText(/3 sets/i)).toBeInTheDocument();
  });

  it('should handle custom workout names', () => {
    const customWorkout: WorkoutSessionData = {
      ...mockWorkout,
      type: 'Custom',
      customName: 'Morning Run',
    };

    render(
      <WorkoutCompleteModal
        isOpen={true}
        onClose={mockOnClose}
        workout={customWorkout}
        nextWorkout="A"
        unit="kg"
      />
    );

    expect(screen.getByText('Morning Run')).toBeInTheDocument();
  });

  it('should work with pounds unit', () => {
    render(
      <WorkoutCompleteModal
        isOpen={true}
        onClose={mockOnClose}
        workout={mockWorkout}
        nextWorkout="B"
        unit="lb"
      />
    );

    // Check that "lb" appears in the document (may appear multiple times)
    expect(screen.getAllByText(/lb/i).length).toBeGreaterThan(0);
    expect(workoutUtils.calculateCalories).toHaveBeenCalledWith(mockWorkout, 'lb');
  });

  it('should display default duration when endTime is missing', () => {
    const workoutWithoutDuration: WorkoutSessionData = {
      ...mockWorkout,
      endTime: undefined,
    };

    render(
      <WorkoutCompleteModal
        isOpen={true}
        onClose={mockOnClose}
        workout={workoutWithoutDuration}
        nextWorkout="B"
        unit="kg"
      />
    );

    // Should not show duration
    expect(screen.queryByText(/minutes/i)).not.toBeInTheDocument();
  });
});
