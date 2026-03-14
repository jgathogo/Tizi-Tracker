# Bangle.js 2 Smartwatch Integration Plan

**Status:** Planned (pending hardware purchase)
**Device:** [Bangle.js 2](https://shop.espruino.com/banglejs2) (~$100 / £83)
**Prerequisite:** Purchase a Bangle.js 2 watch from the Espruino shop

---

## Why Bangle.js 2

Bangle.js 2 is an open-source smartwatch programmable in JavaScript via the Espruino runtime. It connects to web apps through the **Web Bluetooth API**, which works in Chrome on desktop and Android. Because Tizi Tracker is a PWA running in Chrome, it can talk to the watch directly — no native app, no middleware, no server.

### Hardware

| Feature | Detail |
|---------|--------|
| Processor | nRF52840, 64 MHz ARM Cortex-M4 |
| Display | 1.3" 176x176 always-on color LCD, touchscreen |
| Sensors | Heart rate (VC31B), GPS, 3-axis accelerometer, magnetometer, barometer, temperature |
| Output | Vibration motor (`Bangle.buzz()`) |
| Connectivity | Bluetooth LE (Web Bluetooth compatible) |
| Battery | ~4 weeks standby, ~1 week with GPS/HR active |
| Water resistance | IP67 |
| Programming | JavaScript (Espruino), uploaded wirelessly from a browser |

---

## Integration Architecture

```
Tizi Tracker (Chrome/PWA)  <--- Web Bluetooth --->  Bangle.js 2
         Phone                      BLE                  Wrist
```

Communication uses the [puck.js library](https://www.puck-js.com/puck.js) (works with all Espruino devices, not just Puck.js). The library provides:

- `Puck.write(cmd)` — send JavaScript commands to the watch
- `Puck.eval(expr, callback)` — evaluate an expression on the watch and return the result
- UART streaming for continuous data (heart rate, accelerometer)

### Health Connect Path

Bangle.js 2 also integrates with [Gadgetbridge](https://play.google.com/store/apps/details?id=com.espruino.gadgetbridge.banglejs) on Android, which syncs to **Health Connect** natively. This provides a second path for getting workout data into Health Connect without the custom Android companion app:

```
Tizi Tracker --> Web Bluetooth --> Bangle.js 2 --> Gadgetbridge --> Health Connect
```

---

## Planned Features

### Phase 1: Connect and Alert (core value, lowest effort)

**Goal:** Rest timer buzzes on the watch so you don't need to watch your phone between sets.

Features:
- "Connect Watch" button in Settings (uses Web Bluetooth pairing dialog)
- Connection status indicator in the workout view
- When rest timer starts in Tizi: send countdown to watch display
- When rest timer ends: `Bangle.buzz()` vibration alert on wrist
- Interval alerts (30s marks) as short buzzes

Technical approach:
- Tizi sends commands via `Puck.write()` to update the watch display and trigger buzzes
- A small Tizi clock-face app runs on the watch to receive and display timer state
- Connection persists for the duration of the workout session

### Phase 2: Heart Rate Logging

**Goal:** Record heart rate during workouts and store it in workout history.

Features:
- Stream heart rate from Bangle.js HR sensor during active workouts
- Display live HR in the workout view (next to the rest timer)
- Save HR samples (average, peak, resting) with each workout in history
- Show HR chart in workout completion modal and history detail

Technical approach:
- Upload a small script to Bangle.js that calls `Bangle.on('HRM', ...)` and sends readings via `Bluetooth.println()`
- Tizi receives the stream via UART and stores samples in the active session
- New field in `WorkoutSessionData`: `heartRate?: { avg: number, peak: number, samples: { time: number, bpm: number }[] }`

### Phase 3: Set Completion from Wrist

**Goal:** Mark sets complete by tapping the watch, so you don't need to pick up your phone with chalky/sweaty hands.

Features:
- Watch displays: current exercise name, weight, set number (e.g. "Squat 60kg — Set 3/5")
- Tap watch screen or press button to mark set as complete (5 reps)
- Swipe down on watch to mark a failed set (0 reps)
- Watch buzzes to confirm the tap was registered
- Tizi Tracker UI updates in real-time

Technical approach:
- Bidirectional communication: Tizi sends exercise/set state to watch, watch sends tap events back
- Watch app listens for touch/button events and sends `{action: "set_complete", reps: 5}` via Bluetooth
- Tizi listens on the UART stream and calls `updateSet()` when it receives the event

### Phase 4: Standalone Watch App (optional, advanced)

**Goal:** Log workouts entirely from the watch without needing the phone nearby.

Features:
- Bangle.js app that knows your current workout (A or B), exercises, and weights
- Navigate exercises with swipe, tap to complete sets
- Stores workout data in watch flash memory
- Syncs back to Tizi Tracker via Bluetooth when phone is in range

Technical approach:
- Tizi pushes the "next workout" data to watch flash storage when connected
- Self-contained Bangle.js app runs the workout flow
- On reconnect, watch sends completed workout JSON back to Tizi which merges it into history

---

## Data Model Changes

New optional fields on `WorkoutSessionData` (backward compatible):

```typescript
interface WorkoutSessionData {
  // ... existing fields ...
  heartRate?: {
    avg: number;
    peak: number;
    samples: { time: number; bpm: number }[];
  };
  watchConnected?: boolean; // whether a watch was connected during this workout
}
```

New user preference fields on `UserProfile`:

```typescript
interface UserProfile {
  // ... existing fields ...
  watchEnabled?: boolean;       // user has opted in to watch features
  watchAutoConnect?: boolean;   // auto-connect on workout start
}
```

---

## Bangle.js App (runs on the watch)

A small JavaScript app installed on the watch via the [Bangle.js App Loader](https://banglejs.com/apps/). It handles:

1. Receiving timer state and exercise info from Tizi via BLE
2. Displaying timer countdown / exercise info on the watch face
3. Triggering vibration alerts
4. Streaming heart rate data back to Tizi
5. Sending tap/button events for set completion

Estimated size: < 5 KB of JavaScript, well within the watch's 8 MB flash.

---

## Browser Compatibility

Web Bluetooth is required. Supported browsers:

| Browser | Desktop | Android | iOS |
|---------|---------|---------|-----|
| Chrome | Yes | Yes | No |
| Edge | Yes | Yes | No |
| Opera | Yes | Yes | No |
| Safari | No | N/A | No |
| Firefox | No | No | No |

iOS does not support Web Bluetooth natively. The [WebBLE app](https://apps.apple.com/us/app/webble/id1193531073) is a workaround but not a great experience. Bangle.js integration is primarily an Android + desktop Chrome feature.

---

## Puck.js Alternative

[Puck.js v2](https://shop.espruino.com/puckjsv1) (~$40) is a cheaper Espruino device with no screen or vibration. It could serve as a simple "gym clicker" — press the button to mark sets complete. However, it lacks heart rate sensing, display, and haptic feedback, making it far less useful than the Bangle.js 2 for gym workouts.

Consider Puck.js only if budget is very tight and you only want a physical button for set tracking.

---

## Estimated Effort

| Phase | Effort | Dependency |
|-------|--------|------------|
| Phase 1: Connect + rest timer alerts | 2-3 days | Watch in hand |
| Phase 2: Heart rate logging | 2-3 days | Phase 1 |
| Phase 3: Set completion from wrist | 3-4 days | Phase 1 |
| Phase 4: Standalone watch app | 1-2 weeks | Phase 1 |

---

## References

- [Espruino Web Bluetooth guide](https://www.espruino.com/Puck.js+Web+Bluetooth)
- [puck.js library](https://www.puck-js.com/puck.js)
- [Bangle.js 2 API reference](https://www.espruino.com/ReferenceBANGLEJS2)
- [Bangle.js Data Streaming](https://www.espruino.com/Bangle.js+Data+Streaming)
- [Gadgetbridge Health Connect integration](https://gadgetbridge.org/basics/integrations/health-connect/)
- [Bangle.js App Loader](https://banglejs.com/apps/)
