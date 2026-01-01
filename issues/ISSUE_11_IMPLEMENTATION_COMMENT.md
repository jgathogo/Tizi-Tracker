## ✅ Scheduled Date Display on Next Session Dashboard Card

The scheduled date feature has been implemented! The "NEXT 5X5 SESSION" card now displays when the next workout is scheduled.

### What's New:

#### Scheduled Date Display:
- ✅ **Date Calculation** - Uses existing schedule logic to calculate next workout date
- ✅ **Smart Formatting** - Shows "Scheduled for tomorrow" if next workout is tomorrow, otherwise shows full date (e.g., "Scheduled for Friday, 02 Jan")
- ✅ **Calendar Icon** - Added calendar icon for visual clarity
- ✅ **Timezone Aware** - Automatically uses device's local timezone (JavaScript Date handles this)

#### Visual Design:
- ✅ **Prominent Display** - Date shown directly below the "Workout A/B" title
- ✅ **Consistent Styling** - Matches the card's blue gradient theme
- ✅ **Clear Information** - Users can now see exactly when their next workout is scheduled

### How It Works:

1. **Schedule-Based Calculation:**
   - If user has schedule settings (frequency + preferred days), calculates next workout date
   - Respects flexible/strict mode settings
   - Falls back to "tomorrow" if no schedule is set

2. **Date Display:**
   - If next workout is tomorrow: Shows **"Scheduled for tomorrow"**
   - If next workout is further out: Shows **"Scheduled for Friday, 02 Jan"** (full date format)

3. **Example:**
   - User schedules workouts Mon/Wed/Fri
   - Today is Wednesday
   - Dashboard shows: **"Scheduled for Friday, 02 Jan"**
   - Makes it clear when the next session is due

### Technical Details:
- Reuses `getNextWorkoutDate()` function (same logic as WorkoutCompleteModal)
- Date formatting uses `toLocaleDateString()` for timezone-aware display
- Calendar icon from lucide-react for visual consistency
- Smart "tomorrow" detection for better UX

The feature is complete and ready to use! 🎉💪

