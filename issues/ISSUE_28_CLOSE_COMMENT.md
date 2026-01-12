# Issue #28 - Fixed: Weight Reset Bug

## Problem
Bench Press and Barbell Row weights were resetting to default values (20kg and 30kg) instead of progressing after a successful workout.

## Root Cause
The `finishWorkout` function was using stale closure values (`user` from the closure) instead of the latest state. When React state updates happened, the function would use outdated state values, causing weights to reset to defaults.

## Solution
Refactored `finishWorkout` to use functional setState (`setUser(prev => {...})`) instead of relying on the `user` variable from the closure. This ensures the function always works with the latest state, preventing stale closure bugs.

### Changes Made:
1. **App.tsx**: Refactored `finishWorkout` to use `setUser(prev => {...})` pattern
2. **App.test.tsx**: Added integration tests to verify progression logic works correctly for the specific scenario from this issue
3. **Documentation**: Added JSDoc comments explaining the fix and referencing this issue

### Key Changes:
```typescript
// Before (buggy - uses stale closure):
const finishWorkout = () => {
  const newWeights = { ...user.currentWeights }; // ❌ Stale 'user' from closure
  // ...
  setUser(prev => ({ ...prev, currentWeights: newWeights }));
};

// After (fixed - uses latest state):
const finishWorkout = () => {
  setUser(prev => {
    const newWeights = { ...prev.currentWeights }; // ✅ Latest state via 'prev'
    // ...
    return { ...prev, currentWeights: newWeights };
  });
};
```

## Testing
- Added integration tests in `App.test.tsx` that verify weights progress correctly and don't reset to defaults
- Tests specifically cover the scenario from this issue (Bench Press and Barbell Row at 40kg progressing to 42.5kg)
- All tests passing ✅

## Verification
The fix ensures that:
- ✅ Weights progress correctly after successful workouts
- ✅ Bench Press and Barbell Row weights don't reset to defaults
- ✅ State updates always use the latest values (no stale closures)
- ✅ Multiple sequential workouts maintain correct progression

---

**Fixed in commit**: Current
**Related tests**: `App.test.tsx` - Workout Completion Flow tests
