## ✅ Issue Resolved: Weight Per Side / Plate Calculator

All requested features have been implemented and tested! Users can now see exactly how much weight to load on each side of the barbell, eliminating mental math in the gym.

### What's Been Implemented:

#### Weight Per Side Display ✅
- **Exercise Cards** - Shows weight per side directly below the total weight
- **Dashboard Preview** - Next workout preview shows weight per side for each exercise
- **Warmup Calculator** - Shows weight per side for working weight and all warmup sets
- **Automatic Calculation** - Uses standard bar weights (20kg/45lbs) to calculate per-side weight
- **Smart Display** - Only shows when weight > bar weight (hides for empty bar scenarios)

#### Plate Breakdown (Bonus Feature) ✅
- **Detailed Breakdown** - Exercise cards and warmup calculator show specific plates needed (e.g., "20kg + 5kg")
- **Common Plate Sizes** - Supports standard gym plates:
  - kg: 25, 20, 15, 10, 5, 2.5, 1.25
  - lb: 45, 35, 25, 10, 5, 2.5
- **Greedy Algorithm** - Optimizes plate selection (fewest plates possible)
- **Human-Readable Format** - Shows as "20kg + 5kg" or "1×20kg + 2×5kg" for multiple plates

### Display Locations:
- ✅ **Exercise Cards**: Per-side weight and plate breakdown below total weight
- ✅ **Dashboard Preview**: Per-side weight for next workout exercises
- ✅ **Warmup Calculator**: Per-side weight for working weight and each warmup set

### Example:
**Before:**
- Display: "60kg"
- User had to calculate: (60 - 20) / 2 = 20kg per side
- Had to figure out plates: 20kg plate

**After:**
- Display: "60kg"
- Shows: "20kg / side (20kg)"
- User immediately knows: Load one 20kg plate on each side

### Technical Details:
- Created `utils/plateCalculator.ts` utility module with reusable functions
- Updated `ExerciseCard.tsx` to display per-side weight and plate breakdown
- Updated `App.tsx` dashboard preview to show per-side weights
- Updated `WarmupCalculator.tsx` to show per-side weight for all warmup sets
- Handles edge cases (weight <= bar weight shows nothing)
- Supports both kg and lb units
- Consistent styling across all components

Everything is working perfectly! The feature is complete and production-ready. Users can now load the bar faster without mental calculations. 🎉💪





