## ✅ Bug Fixed: Dynamic Date Label

The "Yesterday" label bug has been fixed! The dashboard now shows the correct relative date label based on when the workout actually occurred.

### What's Changed:

#### Dynamic Date Label:
- ✅ **"TODAY"** - Shows when the workout was completed today
- ✅ **"YESTERDAY"** - Shows when the workout was completed yesterday  
- ✅ **Formatted Date** - Shows the actual date (e.g., "Mon, 29 Dec") when the workout is older than yesterday

### Technical Details:

- Added `getRelativeDateLabel()` function that calculates the label based on workout date relative to today
- Compares dates at midnight to ensure accurate day-based comparison
- Uses locale-aware date formatting for dates older than yesterday
- Updated variable name from `yesterdayWorkout` to `recentWorkout` for clarity

### Example Behavior:

- Workout on Dec 31, 2025 (today) → Shows **"TODAY"**
- Workout on Dec 30, 2025 (yesterday) → Shows **"YESTERDAY"**  
- Workout on Dec 29, 2025 (older) → Shows **"Mon, 29 Dec"**

The fix is ready for testing! The label will now correctly reflect when your workout actually happened. 🎉

