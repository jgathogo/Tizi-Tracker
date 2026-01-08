## ✅ Weight Per Side / Plate Calculator Feature

The weight per side and plate breakdown feature has been fully implemented! Users can now see exactly how much weight to load on each side of the barbell, eliminating mental math in the gym.

### What's New:

#### Weight Per Side Display ✅
- **Exercise Cards** - Shows weight per side directly below the total weight
- **Dashboard Preview** - Next workout preview shows weight per side for each exercise
- **Automatic Calculation** - Uses standard bar weights (20kg/45lbs) to calculate per-side weight
- **Smart Display** - Only shows when weight > bar weight (hides for empty bar scenarios)

#### Plate Breakdown (Bonus Feature) ✅
- **Detailed Breakdown** - Exercise cards show specific plates needed (e.g., "20kg + 5kg")
- **Common Plate Sizes** - Supports standard gym plates:
  - kg: 25, 20, 15, 10, 5, 2.5, 1.25
  - lb: 45, 35, 25, 10, 5, 2.5
- **Greedy Algorithm** - Optimizes plate selection (fewest plates possible)
- **Human-Readable Format** - Shows as "20kg + 5kg" or "1×20kg + 2×5kg" for multiple plates

### How It Works:

1. **Weight Per Side Calculation:**
   - Formula: (Total Weight - Bar Weight) / 2
   - Example: 60kg total → (60 - 20) / 2 = 20kg per side
   - Bar weights: 20kg (metric) or 45lbs (imperial)

2. **Plate Breakdown:**
   - Calculates which plates are needed to achieve the per-side weight
   - Uses greedy algorithm (largest plates first)
   - Shows formatted breakdown (e.g., "20kg + 5kg")

3. **Display Locations:**
   - **Exercise Cards**: Shows per-side weight and plate breakdown below total weight
   - **Dashboard Preview**: Shows per-side weight for next workout exercises

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
- Created `utils/plateCalculator.ts` utility module with:
  - `getBarWeight()` - Gets standard bar weight based on unit
  - `getWeightPerSide()` - Calculates weight per side
  - `getPlateBreakdown()` - Calculates specific plates needed
  - `formatPlateBreakdown()` - Formats plates as readable string
- Updated `ExerciseCard.tsx` to display per-side weight and plate breakdown
- Updated `App.tsx` dashboard preview to show per-side weights
- Handles edge cases (weight <= bar weight shows nothing)
- Supports both kg and lb units

### Visual Design:
- Per-side weight shown in smaller, muted text
- Plate breakdown shown in parentheses (optional detail)
- Consistent styling with existing UI
- Non-intrusive - doesn't clutter the interface

The feature is complete and ready to use! Users can now load the bar faster without mental calculations. 🎉💪





