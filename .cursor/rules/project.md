# Tizi Tracker — project context

## Tech stack

- React 19, TypeScript, Vite
- Tailwind CSS 4, DaisyUI 4
- Recharts (progress charts), Lucide React (icons)
- Vitest for tests
- Optional: Google GenAI (Gemini) for form guides (`VITE_*` / `GEMINI_API_KEY` via Vite)
- Optional: Firebase Auth + Firestore for cloud sync (`VITE_FIREBASE_*`)

## Architecture

- Single-page app (SPA), client-only
- **Offline-first**: primary persistence is `localStorage` under key `tizi_tracker_data` (legacy `powerlifts_data` may be migrated on load)
- In-progress workout: `tizi_tracker_active_session`
- Optional signed-in user: merge local profile with Firestore `users/{uid}` via `services/syncService.ts`

## Data model

- See `types.ts`: `UserProfile`, `WorkoutSessionData`, `ExerciseSession`
- `ExerciseSession` may include `targetReps`, `category`: `warmup` | `main` | `accessory` (older saved data omits these; treat as main with default reps)
- `UserProfile` includes `setScheme` (`3x5` | `5x5`), optional `warmups` / `accessories` per workout day, progression fields (`repeatCount`, `weightIncrements`, `consecutiveFailures`, etc.)

## Key files

| Area | Files |
|------|--------|
| App shell, tabs, workout start/finish | `App.tsx` |
| Types | `types.ts` |
| Progression / deload | `utils/progressionUtils.ts` |
| Rest timer durations (main) | `utils/restTimerUtils.ts` |
| Motivation pools | `utils/motivationUtils.ts` |
| UI | `components/` — e.g. `ExerciseCard`, `History`, `SettingsModal`, `WorkoutCompleteModal` |

## Testing

- Run: `npm run test:run` (or `npm test` for watch)
- A pre-commit hook runs the full test suite; changes should keep all tests green before committing.

## Docs in repo

- `README.md`, `CONTRIBUTING.md`, `docs/DEPLOYMENT.md`, `docs/SECURITY_ASSESSMENT.md`
