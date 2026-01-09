# Testing Guide

This document describes the testing infrastructure for Tizi Tracker.

## Setup

The project uses **Vitest** as the test runner (compatible with Vite) and **React Testing Library** for component testing.

### Dependencies

- `vitest` - Test runner
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers for DOM
- `@testing-library/user-event` - User interaction simulation
- `jsdom` - DOM environment for tests

## Running Tests

```bash
# Run tests in watch mode (default)
npm test

# Run tests once and exit
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

Tests are organized alongside the code they test:

```
utils/
  __tests__/
    workoutUtils.test.ts
    progressionUtils.test.ts
components/
  __tests__/
    WorkoutCompleteModal.test.tsx
```

## Test Files

### Unit Tests

#### `utils/__tests__/workoutUtils.test.ts`
Tests for workout utility functions:
- `calculateCalories()` - Calories calculation with various scenarios
- `getNextWorkoutDate()` - Workout scheduling logic with edge cases

#### `utils/__tests__/progressionUtils.test.ts`
Tests for weight progression logic:
- `calculateProgression()` - Weight increment calculations
- Repeat count handling
- Attempt tracking

### Component Tests

#### `components/__tests__/WorkoutCompleteModal.test.tsx`
Tests for the WorkoutCompleteModal component:
- Rendering conditions
- Data display
- User interactions
- Props handling

## Writing Tests

### Example Unit Test

```typescript
import { describe, it, expect } from 'vitest';
import { calculateCalories } from '../workoutUtils';

describe('calculateCalories', () => {
  it('should calculate calories correctly', () => {
    const workout = { /* ... */ };
    const result = calculateCalories(workout, 'kg');
    expect(result).toBe(675);
  });
});
```

### Example Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Test Coverage

Current test coverage includes:
- ✅ Core workout utilities (`calculateCalories`, `getNextWorkoutDate`)
- ✅ Progression logic (`calculateProgression`)
- ✅ WorkoutCompleteModal component

Future coverage targets:
- [ ] ExerciseCard component
- [ ] SettingsModal component
- [ ] History component
- [ ] Progress component
- [ ] Auth and sync services

## CI Integration

Tests can be run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm run test:run
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the function/component does, not how it does it.
2. **Edge Cases**: Test boundary conditions, null values, and error cases.
3. **Descriptive Names**: Use clear test names that describe what is being tested.
4. **Arrange-Act-Assert**: Structure tests with setup, action, and verification.
5. **Mock External Dependencies**: Mock Firebase, API calls, and other external services.

## Troubleshooting

### Tests failing with date-related issues
- Date mocking in Vitest can be tricky. Use `vi.useFakeTimers()` and `vi.setSystemTime()`.
- Consider testing relative dates rather than absolute dates when possible.

### Component tests failing
- Ensure all required props are provided.
- Check for async operations that need `waitFor` or `findBy` queries.
- Verify mocked modules are set up correctly.
