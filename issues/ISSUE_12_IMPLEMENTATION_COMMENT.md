## ✅ Configurable Weight Increments per Exercise

The configurable weight increments feature has been fully implemented! Users can now set custom weight increments for each exercise, solving the problem where the app suggested incorrect next weights.

### What's New:

#### Weight Increments Configuration ✅
- **Per-Exercise Settings** - Each major lift (Squat, Bench Press, Barbell Row, Overhead Press, Deadlift) can have its own increment
- **Settings UI** - New "Weight Increments" section in Settings → Progression Settings
- **Real-time Updates** - Changes save immediately and affect next workout calculations
- **Defaults Preserved** - New users get sensible defaults (2.5kg for most, 5kg for Deadlift)

#### Smart Defaults ✅
- **Default Values**:
  - Squat: 2.5kg (or user's unit equivalent)
  - Bench Press: 2.5kg
  - Barbell Row: 2.5kg
  - Overhead Press: 2.5kg
  - Deadlift: 5kg
- **Fallback Logic** - If no custom increment is set, uses defaults

#### Automatic Progression ✅
- **Updated Logic** - Workout completion logic now uses user-defined increments
- **Accurate Next Weights** - "Next 5x5 Session" card now shows correct expected weights
- **Flexible Increments** - Supports any increment value (0.5kg steps, user's unit)

### How It Works:

1. **Configuration:**
   - Go to Settings → Weight Increments section
   - Set increment for each exercise (e.g., Squat: 5.0kg, Bench Press: 2.5kg)
   - Values save automatically

2. **Automatic Progression:**
   - When completing required attempts at a weight, app increases by configured increment
   - Example: If Squat increment is 5kg and current weight is 50kg, next will be 55kg (not 52.5kg)

3. **Use Cases:**
   - User has 5kg plates only → Set increments to 5kg for all exercises
   - User progresses faster on Squat → Set Squat increment to 5kg, others to 2.5kg
   - User lacks 1.25kg plates → Set all increments to 2.5kg minimum

### Technical Details:
- Added `weightIncrements` field to `UserProfile` interface (Record<string, number>)
- Updated `finishWorkout()` to use `user.weightIncrements?.[exerciseName] ?? defaultIncrement`
- Settings UI allows editing increments with proper validation
- Backward compatible: existing users get defaults applied automatically
- Supports both kg and lb units (increment value is unit-agnostic)

### Example:
**Before:**
- User progresses Squat by 5kg (40kg → 45kg → 50kg)
- App suggested 52.5kg (using hardcoded 2.5kg increment)
- User had to manually adjust

**After:**
- User sets Squat increment to 5kg in Settings
- App correctly suggests 55kg after completing 50kg
- "Next 5x5 Session" card shows accurate expected weights

The feature is complete and ready to use! 🎉💪


