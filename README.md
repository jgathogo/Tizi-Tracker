# Tizi Tracker

A fitness tracker built for the 5x5 strength program and general activity logging. Track your lifts, follow progressive overload, and log any workout — all from your phone's browser.

## Features

### 5x5 Strength Program
- Workout A/B alternation (A: Squat, Bench Press, Barbell Row | B: Squat, Overhead Press, Deadlift)
- Automatic weight progression based on completed sets
- Per-exercise repeat count and weight increment settings
- Attempt tracking at each weight level
- Plate calculator showing weight per side and plate breakdown
- Warmup calculator with progressive loading sets

### Failure Handling and Deloads
- Tracks consecutive failures per exercise
- Automatic 10% deload after 3 consecutive failures at the same weight
- Context-aware feedback: early-set failures (recovery issues) vs late-set failures (normal limit)
- Dashboard shows retry count and encouraging guidance for stalled exercises
- Deload details shown in the workout completion summary with recovery timeline

### Motivation and Streaks
- Workout streak tracking (calendar days of consistent training, rest-day aware)
- Monthly workout count displayed on dashboard and after each session
- Personalized greeting on the home page with streak and monthly stats
- Randomized motivational messages drawn from centralized pools for variety
- Weekly goal tracking with progress indicators
- Context-aware completion modal: different feedback for perfect sessions, tough sessions, and deloads

### Activity Logging
- Log any custom activity (running, skipping, yoga, etc.)
- Add exercises on the fly during a workout
- Session notes and workout timer

### Tools
- Rest timer with dockable, floating, and micro modes
  - Dynamic duration based on set performance (longer rest after failed sets)
  - Interval alerts and audible notifications
  - Pause, resume, and manual time adjustments
- Warmup calculator with per-session state tracking
- Weight adjustment modal with fine-grained increments
- AI form guide powered by Google Gemini (optional, requires API key)

### Analytics
- Progress charts showing weight trends over time
- Workout history with total volume and per-exercise breakdowns
- Session status indicators (passed/failed) in history view
- Calories estimation after each workout
- Next workout prediction with scheduled date

### Personalization
- User profile (name, date of birth, height, body weight)
- Workout schedule (frequency, preferred days, flexible mode)
- 30+ themes via DaisyUI (dark, light, cupcake, cyberpunk, etc.)
- Configurable rest timer behaviour

### Data
- Automatic save to browser localStorage
- JSON export/import for backups
- Auto-backup after each completed workout
- Optional cloud sync via Firebase (Google or email sign-in)
- Works offline; syncs when connection is restored

## Tech Stack

- React 19, TypeScript
- Tailwind CSS 4, DaisyUI 4
- Recharts (charts)
- Lucide React (icons)
- Google GenAI / Gemini API (optional AI coach)
- Firebase Authentication and Cloud Firestore (optional cloud sync)
- Vitest (testing)
- Vite (build tooling)

## Getting Started

```bash
npm install --legacy-peer-deps
npm run dev
```

Open `http://localhost:3000` in your browser (works best on mobile).

### Running Tests

```bash
npm test              # watch mode
npm run test:run      # single run
npm run test:coverage # with coverage report
```

Tests run automatically before each commit via a pre-commit hook.

### Production Build

```bash
npm run build
```

### Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for instructions on deploying to Vercel, Netlify, or GitHub Pages.

## Health Connect (Android)

A companion Android app syncs completed workouts to Health Connect (Google Health, Samsung Health, etc.). Requires Firebase cloud sync. See [android-companion/README.md](./android-companion/README.md).

## Security

- API keys are loaded from environment variables, never committed to the repo
- Firebase config uses `import.meta.env.VITE_*` placeholders
- `.gitignore` excludes `.env`, data exports, and build artifacts
- See [docs/SECURITY_ASSESSMENT.md](./docs/SECURITY_ASSESSMENT.md) for the full assessment

## Contributing

- [Report issues](https://github.com/jgathogo/Tizi-Tracker/issues)
- [Contributing guide](./CONTRIBUTING.md)
