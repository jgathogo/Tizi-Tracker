## Fixed: "Finish & Log" Button No Longer Covered by Navigation Bar

### Root Cause
The "Finish & Log" button container and the bottom navigation bar were both positioned at `fixed bottom-0`, with the nav bar at `z-50` covering the button at `z-40`.

### Fix Applied
- **Finish button container**: Changed from `bottom-0` to `bottom-[72px]`, placing it above the 68px-tall navigation bar
- **Active session padding**: Increased from `pb-32` to `pb-48` to ensure content scrolls clear of both fixed elements

### Files Modified
- `App.tsx` — Two class changes in `renderActiveSession()`

### Testing
- All 150 tests passing
- Both the Finish button and navigation bar are now fully visible and clickable during active workouts
