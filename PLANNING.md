# Tizi Tracker: Future Roadmap & Development Strategy

**Current State:** A robust, tailored 5x5 Progressive Overload tracker for James Gathogo.
**Future Vision:** A generic, adaptable fitness platform allowing any user to define custom workout regimes (e.g., Split routines, Cardio plans, Calisthenics), similar to the flexibility found in apps like StrongLifts or Hevy.

---

## 🚀 Phase 1: Perfecting "The Core" (In Progress)

*Goal: Ensure the app is bug-free and fully featured for the primary user (James).*

Before expanding to other users, the core mechanics must be bulletproof.

### Progress Status

1. ✅ **Stability**: 
   - Comprehensive test suite with 144+ tests covering edge cases
   - Pre-commit hooks ensure code quality
   - Weight progression logic tested and verified
   - Next workout calculation logic tested
   - Timer logic tested with various scenarios

2. ✅ **UI/UX Polish**: 
   - DaisyUI theme integration complete (30+ themes)
   - All hardcoded colors replaced with semantic classes
   - Theme-aware components with proper contrast
   - Navigation accessible during active workouts
   - Settings accessible from workout header

3. ⚠️ **Data Integrity**: 
   - Cloud Sync (Firebase) implemented
   - Merge conflict handling needs verification
   - *Status: Functional but may need edge case testing*

4. ✅ **Analytics**: 
   - Progress charts implemented with Recharts
   - Visual trends showing strength progression
   - Theme-aware chart styling

### Recent Enhancements Completed

- ✅ Rest Timer: Dockable mode, interval alerts, audible notifications
- ✅ Smart Failure Logic: Automatic deload after consecutive failures
- ✅ Navigation During Workouts: Settings access, persistent navigation bar
- ✅ Warmup Calculator: Per-session state tracking
- ✅ Theme System: Full DaisyUI integration with 30+ themes
- ✅ Testing Infrastructure: Comprehensive test suite with pre-commit hooks

### Remaining Phase 1 Tasks

- [ ] Verify Cloud Sync merge conflict handling in edge cases
- [ ] Complete any remaining theme contrast fixes (ongoing as issues are reported)
- [ ] Performance optimization if needed

---

## 🏗️ Phase 2: The "Abstraction" (Architectural Shift)

*Goal: Remove hardcoded "Workout A/B" logic and replace it with a dynamic "Program Engine".*

Currently, the code has:
```typescript
const PROGRAMS = { 
  'A': ['Squat', 'Bench Press', 'Barbell Row'], 
  'B': ['Squat', 'Overhead Press', 'Deadlift'] 
}
```

### 2.1 Data Structure Migration

Move `PROGRAMS` from a constant variable into the `UserProfile` state.

**Target Structure:**
```typescript
interface UserProfile {
  // ... existing fields
  activeProgram: {
    name: "James 5x5",
    workouts: [
      { id: "A", name: "Workout A", exercises: ["Squat", "Bench Press", "Barbell Row"] },
      { id: "B", name: "Workout B", exercises: ["Squat", "Overhead Press", "Deadlift"] }
    ],
    scheduleRule: "ALTERNATING" // or "WEEKLY_FIXED" (e.g., Chest on Monday)
  }
}
```

### 2.2 Dynamic Rendering

Update `App.tsx` and related components to:
- Stop looking for "Workout A" specifically
- Render `user.activeProgram.currentWorkout` dynamically
- Support multiple workout types and schedules

### 2.3 Migration Strategy

1. Create new `activeProgram` field in `UserProfile` interface
2. Add migration logic to convert existing `nextWorkout: 'A' | 'B'` to new structure
3. Update all workout rendering logic to use dynamic program
4. Maintain backward compatibility during transition
5. Test thoroughly with existing data

---

## 🤝 Phase 3: The "Friend" Update (Onboarding & Customization)

*Goal: Allow a new user (the friend) to configure the app for *their* needs without coding.*

### 3.1 The Onboarding Wizard

When a new user signs up (or resets data), present:

1. **"What is your goal?"** (Strength, Cardio, Flexibility)
2. **"Choose a Template"**:
   - *StrongLifts 5x5* (The current default)
   - *Push/Pull/Legs* (3-day split)
   - *Upper/Lower* (4-day split)
   - *Custom / Empty* (Build from scratch)

### 3.2 Workout Editor (The "StrongLifts" Feature)

Create a UI that allows users to:

- Add/Remove Workouts (e.g., Add "Workout C")
- Add/Remove Exercises to a workout
- Define set/rep schemes (e.g., 3x10 instead of 5x5)
- **Settings per Exercise**: Allow specifying if an exercise uses "Progressive Overload" (auto-add weight) or "Duration" (running)
- Configure weight increments per exercise
- Set repeat counts per exercise

---

## 🌳 Development & Git Branching Strategy

This project faces a common challenge: **Maintaining a stable personal version while developing a complex generic version.**

### The Recommended Approach: "Configuration over Branching"

*Do not maintain two separate long-lived branches (e.g., `james-version` and `generic-version`). This leads to "Merge Hell" where fixing a bug in the Timer on one branch requires painful manual copying to the other.*

**The Solution:**
Make "James's 5x5" simply the **Default Configuration** of the Generic App.

1. **Main Branch (`main`)**: This contains the *Generic* Tizi Tracker code.
2. **Configuration File**: Create a `defaultProgram.ts`.
   - For James: The app detects your User ID (or a local setting) and loads your specific 5x5 config.
   - For Others: It loads the "Empty" or "Template Selection" screen.

**Why this is better:**
If you improve the **Rest Timer** or **Charts**, *both* you and your friend get the upgrade immediately. You don't have to merge code between branches.

### If You MUST Use Branches (The "Complex Animal" Approach)

If the Generic version requires such massive changes that it breaks the current 5x5 logic temporarily:

1. **`main`**: This remains your stable, working 5x5 app.
2. **`feature/v2-generic-engine`**: Create this branch to rewrite the core logic.
   - Work here for weeks/months.
3. **Backporting**: If you fix a bug in `main` (e.g., styling fix), you must `git merge main` into `feature/v2-generic-engine` frequently.
4. **The Switch**: Once `v2-generic-engine` is working and you have recreated your 5x5 routine *inside* the new generic engine, you merge it into `main` and archive the old logic.

---

## 🔮 Phase 4: Social & Cloud (Future)

- **Share Workouts**: Export a routine as a JSON link so your friend can import "James's 5x5" instantly.
- **Leaderboards**: Compare lifts with friends (requires Firebase expansion).
- **Workout Templates Marketplace**: Users can share and discover workout programs.

---

## Execution Plan

### Next Steps

1. ✅ **Phase 1**: Continue fixing bugs and polishing UI (mostly complete)
2. **Phase 2**: Start on a new branch called `refactor/dynamic-programs`
   - This is where you rip out the hardcoded `PROGRAMS` constant
   - Make it load from `user.activeProgram` instead
   - Test thoroughly before merging
3. **Phase 3**: Build onboarding wizard and workout editor UI
4. **Phase 4**: Social features (future consideration)

### Branch Strategy for Phase 2

When ready to start Phase 2:
```bash
# Create feature branch
git checkout -b refactor/dynamic-programs

# Work on abstraction
# ... make changes ...

# Test thoroughly
npm run test:run

# Merge back when stable
git checkout main
git merge refactor/dynamic-programs
```

---

**Last Updated**: January 2025
**Current Phase**: Phase 1 (Nearly Complete) → Phase 2 (Ready to Start)
