# Issue 27: Warmup Sets Incorrectly Show as "Completed" from Previous Sessions - Fixed ✅

## Summary
Fixed the bug where warmup sets appeared as already completed when opening the Warmup Calculator for a new workout session with the same exercise and weight. The fix ensures each workout session has its own isolated warmup state.

## Problem
When opening the Warmup Calculator, sets sometimes appeared already checked/completed from previous sessions. This happened when:
- Performing an exercise at a weight that had been done previously
- The app "remembered" warmup completion from a past workout
- Opening warmup calculator for a new session with the same exercise/weight combination

**Root Cause:**
The `storageKey` was defined as `warmup_${exerciseName}_${workWeight}`, which lacked a unique session identifier. Consequently, `localStorage` retrieved the boolean flags from the last time this specific name/weight combination was used, causing cross-session persistence.

## Solution Implemented

### 1. Added Session ID to Storage Key ✅
- **File**: `components/WarmupCalculator.tsx`
- Added optional `sessionId` prop to `WarmupCalculator` component
- Updated `storageKey` to include session ID: `warmup_${exerciseName}_${workWeight}_${sessionId}`
- Each workout session now has its own isolated warmup state

### 2. Pass Session ID from App ✅
- **File**: `App.tsx`
- Pass `activeSession?.id` to `WarmupCalculator` component
- Uses the workout session's unique ID to isolate warmup state

### 3. Backward Compatibility ✅
- Maintains backward compatibility when `sessionId` is not provided
- Falls back to old storage key format: `warmup_${exerciseName}_${workWeight}`
- Existing functionality preserved for edge cases

## Technical Implementation

### Changes to WarmupCalculator

**Before:**
```typescript
const storageKey = `warmup_${exerciseName}_${workWeight}`;
```

**After:**
```typescript
const storageKey = sessionId 
  ? `warmup_${exerciseName}_${workWeight}_${sessionId}`
  : `warmup_${exerciseName}_${workWeight}`; // Fallback for backward compatibility
```

### Changes to App.tsx

**Before:**
```typescript
<WarmupCalculator 
  exerciseName={warmupModal.name} 
  workWeight={warmupModal.weight} 
  unit={user.unit}
  onClose={() => setWarmupModal(null)}
  ...
/>
```

**After:**
```typescript
<WarmupCalculator 
  exerciseName={warmupModal.name} 
  workWeight={warmupModal.weight} 
  unit={user.unit}
  sessionId={activeSession?.id} // Pass session ID to isolate warmup state
  onClose={() => setWarmupModal(null)}
  ...
/>
```

## User Experience

### Before
- Warmup sets showed as completed from previous sessions
- Had to manually reset warmup state for each new workout
- Confusing when same exercise/weight was used in different sessions
- Lost track of which warmups were actually completed in current session

### After
- ✅ Each workout session starts with fresh warmup state
- ✅ No cross-session persistence of warmup completion
- ✅ Clear indication of which warmups are completed in current session
- ✅ No manual reset needed between sessions

## Example Scenario

**Before Fix:**
1. Day 1: Squat 100kg - Complete all warmups
2. Day 2: Squat 100kg - Open warmup calculator
3. **Result**: All warmups already marked as completed ❌

**After Fix:**
1. Day 1: Squat 100kg (Session ID: `1234567890`) - Complete all warmups
2. Day 2: Squat 100kg (Session ID: `1234567891`) - Open warmup calculator
3. **Result**: Fresh warmup state, nothing pre-completed ✅

## Testing

### Test Coverage
- **Total Tests**: 139 tests (all passing)
- **New Tests Added**: 4 tests for session isolation

### Test Results
```
✓ components/__tests__/WarmupCalculator.test.tsx (18 tests)
✓ All existing tests continue to pass

Test Files  11 passed (11)
Tests  139 passed (139)
```

### New Tests
1. `should isolate warmup state per session when sessionId is provided` - Verifies different sessions have isolated state
2. `should use different storage keys for different sessions` - Verifies storage key uniqueness
3. `should maintain backward compatibility when sessionId is not provided` - Verifies fallback behavior
4. `should reset warmup state when opening calculator for new session with same weight` - Verifies fresh start for new sessions

## Files Modified

1. **Modified**:
   - `components/WarmupCalculator.tsx` - Added `sessionId` prop and updated storage key
   - `App.tsx` - Pass `activeSession?.id` to WarmupCalculator
   - `components/__tests__/WarmupCalculator.test.tsx` - Added session isolation tests

## Benefits

1. **Session Isolation**: Each workout session has its own warmup state
2. **No Cross-Contamination**: Previous session's warmup state doesn't affect new sessions
3. **Accurate Tracking**: Users can accurately track which warmups are completed in current session
4. **Better UX**: No confusion about warmup completion status
5. **Backward Compatible**: Still works if sessionId is not provided

## Storage Key Format

**With Session ID:**
- Format: `warmup_${exerciseName}_${workWeight}_${sessionId}`
- Example: `warmup_Squat_100_1736448000000`

**Without Session ID (Backward Compatible):**
- Format: `warmup_${exerciseName}_${workWeight}`
- Example: `warmup_Squat_100`

## Status
✅ **COMPLETE** - Warmup state isolation per session implemented, tested, and verified
