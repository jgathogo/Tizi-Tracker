# Issue 25: Rest Timer Should Continue Counting After Zero (Overrun) - Implemented ✅

## Summary
Modified the Rest Timer to continue counting after reaching zero, showing negative time (overrun) to track total rest duration even when users rest longer than the set time.

## Problem
The Rest Timer stopped automatically when it reached `00:00`, which was limiting because:
- Users often rest longer than the set time
- Once the timer stopped, they lost track of their **total** rest duration
- No way to see how much extra time had elapsed

## Solution Implemented

### 1. Overrun Logic ✅
- **Modified**: `components/RestTimer.tsx`
- Timer no longer stops at zero
- Continues counting into negative numbers (e.g., `-0:05`, `-0:10`, `-0:15`)
- Shows total rest duration including overrun time

### 2. Visual Feedback ✅
- **Color Changes**:
  - **White**: During countdown (positive time)
  - **Amber**: When exactly at zero (`0:00`)
  - **Red**: When in overrun (negative time, e.g., `-0:05`)
- Clear visual cue that rest period is over but timer still tracking

### 3. Formatting for Negative Time ✅
- Updated `formatTime()` function to handle negative seconds
- Displays as `-MM:SS` format (e.g., `-0:05`, `-0:15`, `-1:30`)
- Properly formats negative time with minutes and seconds

### 4. onComplete Behavior ✅
- `onComplete` callback still triggers when timer reaches zero
- Timer continues counting after callback is triggered
- `onComplete` only called once per timer session (not repeatedly)

### 5. Manual Stop Only ✅
- Timer only stops when user manually:
  - Clicks "Stop" (X button)
  - Clicks "Pause"
  - Clicks "Reset" (refresh button)
- Timer does NOT auto-stop at zero

## Technical Implementation

### Changes to RestTimer Component

1. **Removed Auto-Stop Logic**:
   ```typescript
   // OLD: Stopped at zero
   if (isActive && seconds > 0) { ... }
   else if (seconds === 0) { setIsActive(false); ... }
   
   // NEW: Continues counting
   if (isActive) { ... } // No check for seconds > 0
   ```

2. **Updated formatTime Function**:
   ```typescript
   const formatTime = (sec: number) => {
     const isNegative = sec < 0;
     const absSec = Math.abs(sec);
     const m = Math.floor(absSec / 60);
     const s = absSec % 60;
     const formatted = `${m}:${s < 10 ? '0' : ''}${s}`;
     return isNegative ? `-${formatted}` : formatted;
   };
   ```

3. **Color Logic**:
   ```typescript
   className={`text-5xl font-mono font-bold ${
     seconds < 0 
       ? 'text-red-400'      // Red when in overrun
       : seconds === 0 
         ? 'text-amber-400'  // Amber when exactly at zero
         : 'text-white'      // White during countdown
   }`}
   ```

4. **onComplete Tracking**:
   - Uses `useRef` to track if `onComplete` has been called
   - Resets when timer is reset or new timer starts
   - Calls `onComplete` once when reaching zero, then continues

5. **Removed Lower Bound**:
   - Removed `Math.max(0, ...)` from `subTime` function
   - Allows negative values when subtracting time

## User Experience

### Before
- Timer stopped at `00:00`
- Lost track of total rest time if resting longer
- Had to manually calculate overrun time

### After
- ✅ Timer continues counting after zero
- ✅ Shows negative time (e.g., `-0:15`) for overrun
- ✅ Red color indicates rest period is over
- ✅ Total rest duration always visible
- ✅ Can see exactly how long they've been resting

## Visual States

1. **Countdown (White)**: `1:30`, `1:29`, `1:28`, ... `0:01`
2. **At Zero (Amber)**: `0:00`
3. **Overrun (Red)**: `-0:01`, `-0:05`, `-0:15`, `-1:30`, etc.

## Testing

### Test Coverage
- **Total Tests**: 121 tests (all passing)
- **Updated Tests**: Modified existing tests for overrun behavior
- **New Tests Added**: 6 new tests for overrun functionality

### Test Results
```
✓ components/__tests__/RestTimer.test.tsx (18 tests)
✓ All existing tests continue to pass

Test Files  10 passed (10)
Tests  121 passed (121)
```

### New Tests
1. `should allow negative seconds (overrun)` - Verifies timer can go negative
2. `should call onComplete when timer reaches 0 and continue counting` - Verifies onComplete triggers but timer continues
3. `should continue counting after reaching zero (overrun)` - Verifies continuous counting
4. `should format negative time correctly` - Verifies negative time formatting
5. `should show red color when in overrun (negative time)` - Verifies color change
6. `should format negative time with minutes correctly` - Verifies formatting with minutes

## Files Modified

1. **Modified**:
   - `components/RestTimer.tsx` - Added overrun logic, negative time formatting, color changes
   - `components/__tests__/RestTimer.test.tsx` - Updated and added tests for overrun

## Benefits

1. **Total Rest Tracking**: Users can see exactly how long they've been resting, including overrun
2. **No Lost Time**: Timer never stops, so no time is lost
3. **Visual Feedback**: Color changes provide clear indication of timer state
4. **Flexibility**: Users can rest as long as needed while still tracking total time
5. **Better Planning**: Helps users understand their actual rest patterns

## Status
✅ **COMPLETE** - Rest Timer overrun functionality implemented, tested, and verified
