# Tizi Tracker

A versatile and modern fitness tracker designed for all types of activities. Whether you are following a strict 5x5 strength program, going for a run, skipping, or doing a custom workout, Tizi Tracker helps you capture every session with ease.

## Key Features

### 🏋️ 5x5 Strength Hub
- **Workout A/B Alternation**: Automatically tracks and alternates between Workout A (Squat, Bench Press, Barbell Row) and Workout B (Squat, Overhead Press, Deadlift)
- **Progressive Overload**: Automatic weight progression based on successful sets
- **Per-Exercise Settings**: Customize how many times to repeat each exercise at a weight before progressing
- **Custom Weight Increments**: Set different weight increments per exercise (e.g., 2.5kg for Squat, 5kg for Deadlift)
- **Attempt Tracking**: See which attempt you're on at each weight (1st, 2nd, 3rd time, etc.)
- **Plate Calculator**: Automatically shows weight per side and plate breakdown for each exercise

### 📝 Activity Logging
- **Custom Workouts**: Create any custom activity (Skipping, Yoga, Cardio, etc.)
- **Dynamic Exercise Addition**: Add custom exercises on the fly during workouts
- **Notes & Tracking**: Add notes to workouts and track completion status

### 🤖 AI Coach
- **Form Guidance**: Integrated Google Gemini AI provides form cues for major lifts
- **Video Links**: AI finds and displays instructional videos for proper form

### 🛠️ Advanced Tools
- **Rest Timer**: Built-in timer to track rest periods between sets
- **Warmup Calculator**: Automatic warmup calculations with plate breakdown
- **Weight Micro-Adjustments**: Fine-tune weights with small increments (+/- 1.25kg, 2.5kg, 5kg, etc.)
- **Manual Weight Editing**: Adjust weights and attempt numbers manually anytime

### 📊 Analytics & Progress
- **Progress Charts**: Visual trends showing strength progression over time using Recharts
- **Workout History**: Complete history of all workouts with total volume calculations
- **Next Workout Prediction**: Dashboard shows your next scheduled workout with weights and exercises
- **Calories Estimation**: Estimated calories burned after each workout
- **Delete Workouts**: Remove past workouts for testing or data cleanup

### ⚙️ Personalization
- **User Profile**: Set your name, date of birth, height, and body weight
- **Workout Schedule**: Configure workout frequency (1-7 per week), preferred days, and flexible scheduling
- **Next Workout Date**: Automatic calculation of next workout date based on your schedule and rest requirements
- **Personalized Messages**: Congratulations and encouragement personalized with your name

### 💾 Data Management
- **Automatic Saving**: All data stored locally in browser localStorage
- **Export/Import**: Download JSON backups and restore from backups
- **Cloud Sync** (Optional): Sync workout data across all devices using Firebase
  - Google Sign-In or Email/Password authentication
  - Automatic sync when online
  - Works offline - syncs when connection restored
  - Cross-device access to your data

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS
- Lucide React Icons
- Recharts Visualization
- Google GenAI (Gemini API)
- Firebase (Authentication & Cloud Firestore) - Optional cloud sync

## Data Persistence

**Your data is automatically saved!** Tizi Tracker uses browser localStorage to remember:

- ✅ All workout history
- ✅ Current weights for each exercise
- ✅ Next workout (A or B alternation)
- ✅ Your preferences (units, etc.)

**The app tracks:**
- **Previous workouts** - See your last workout on the dashboard
- **Next workout** - Dashboard shows your next scheduled workout with exercises, weights, and date
- **Complete history** - View all past workouts in the History tab with total volume
- **Progress trends** - Visual charts show your strength progression over time
- **Per-exercise progression** - Track attempts and progression for each exercise individually

**Backup your data:**
- Settings → Export Data (downloads JSON file)
- Settings → Import Data (restore from backup)

**Cloud Sync (Optional):**
- Settings → Cloud Sync → Sign In
- Choose Google Sign-In or Email/Password
- Your data automatically syncs across all devices
- Works offline - syncs when online
- Reset data syncs immediately to cloud
- See [Firebase Setup Guide](./docs/FIREBASE_SETUP.md) for configuration

## Getting Started

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Deploy to Your Phone

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions on:
- Deploying to Vercel/Netlify (free hosting)
- Setting up GitHub Pages
- Accessing via local network
- Self-hosting options

## Debugging & Monitoring

Need to debug the app on your phone or share issues with developers?

- 🔍 [Remote Debugging Guide](./docs/REMOTE_DEBUGGING.md) - Connect your phone for debugging
- 📱 Chrome Remote Debugging (Android)
- 🍎 Safari Web Inspector (iOS)
- 🌐 ngrok for sharing your local dev server
- 📊 Enhanced console logging for easier troubleshooting

## Contributing

Found a bug? Have a feature idea? Want to help improve Tizi Tracker?

- 📋 [Report Issues](https://github.com/jgathogo/Tizi-Tracker/issues)
- 💡 [Suggest Enhancements](https://github.com/jgathogo/Tizi-Tracker/issues/new)
- 📖 [Contributing Guide](./CONTRIBUTING.md)

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Re-creating This App (AI Prompt)

> "Build a React-based fitness logger called 'Tizi Tracker'. The app should be a versatile activity tracker with a specialized module for 5x5 lifting programs.
> 
> **Core Features:**
> - 5x5 Strength Hub: Workout A/B alternation (A: Squat, Bench, Row | B: Squat, OHP, Deadlift)
> - Custom workout logging for any activity (Skipping, Yoga, Cardio)
> - Automatic progressive overload with per-exercise settings
> - Per-exercise repeat count and weight increment configuration
> - Attempt tracking (1st, 2nd, 3rd time at each weight)
> 
> **Dashboard:** Features a 'Quick Start' showing the next scheduled workout with exercises, weights, and date. Shows last workout summary and next workout prediction.
> 
> **Workout View:** Interactive exercise cards with set trackers. Include plate calculator (weight per side, plate breakdown), warmup calculator with plate breakdown, AI form guide (Gemini API), rest timer, and manual weight/attempt editing.
> 
> **Progression Logic:** Automatic progression when sets are completed. Per-exercise repeat count (how many times to repeat at weight before progressing). Custom weight increments per exercise (e.g., 2.5kg for most, 5kg for Deadlift). Track attempts per exercise.
> 
> **Personalization:**
> - User profile (name, date of birth, height, body weight)
> - Workout schedule (frequency per week, preferred days, flexible scheduling)
> - Next workout date calculation based on schedule and rest requirements
> - Personalized congratulations after workouts
> 
> **Analytics:** History view with total volume metrics, delete workout capability, calories estimation after workouts, progress charts using Recharts, and JSON Export/Import for backups.
> 
> **Cloud Sync (Optional):** Firebase authentication (Google Sign-In or Email/Password), automatic sync when online, works offline, cross-device access, reset data syncs immediately.
> 
> **UI:** Dark slate and blue theme with high-quality rounded corners and smooth transitions. Mobile-responsive design. Settings modal with scrollable sections. Workout completion modal with personalized congratulations."
