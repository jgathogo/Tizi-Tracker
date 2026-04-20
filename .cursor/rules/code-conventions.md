# Tizi Tracker — code conventions

## Contrast and theming

- Prefer **DaisyUI semantic classes** (`text-base-content`, `bg-error`, `text-success`, `border-base-300`, etc.). Avoid hardcoded Tailwind palette colors (`text-red-400`, `bg-green-900`, `text-blue-300`) so every theme stays readable.
- Avoid `text-base-content/50` or lower for labels users must read outdoors; use at least `/60`–`/70` for secondary text. Interactive targets (set circles, buttons) need visible borders, not `text-transparent` on near-matching backgrounds.

## Tone and UI copy

- Avoid unnecessary emojis in UI, README, and user-facing strings unless the product already uses them consistently in that surface.
- Prefer clear, short labels over marketing fluff.

## Comments

- Comment **why** or non-obvious constraints, not what the next line does.
- Do not narrate obvious React/TypeScript mechanics.

## Backward compatibility

- Older `localStorage` exports and in-browser state may lack new fields (`category`, `targetReps`, `setScheme`, custom warmups/accessories).
- Treat missing `category` on standard A/B lifts as **main**; default `targetReps` to **5** where needed.
- Preserve migration paths (e.g. legacy `powerlifts_data` key) when touching load/save logic.

## Workout model

- **Warmup**: no barbell progression; short rest; bodyweight or time-based targets.
- **Accessory**: persisted weight for next session; no StrongLifts deload/attempt progression in `finishWorkout` (see `App.tsx`).
- **Main**: full progression/deload via `calculateProgression` in `utils/progressionUtils.ts` (respects `targetReps` and set count).

## Motivational copy

- Use centralized pools and `pick(MSG.*)` from `utils/motivationUtils.ts` (or extend `MSG` there). Avoid one-off hardcoded motivational strings scattered in components.

## Quality gate

- `npm run build` must succeed.
- `npm run test:run` must pass before committing (pre-commit hook enforces this).

## Security / privacy

- Public repo: no credentials, no real user data, no private URLs that leak infrastructure beyond what’s already documented.
- See `docs/SECURITY_ASSESSMENT.md` when changing auth, sync, or data export.
