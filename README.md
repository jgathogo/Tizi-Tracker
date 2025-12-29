# Tizi Tracker

A versatile and modern fitness tracker designed for all types of activities. Whether you are following a strict 5x5 strength program, going for a run, skipping, or doing a custom workout, Tizi Tracker helps you capture every session with ease.

## Key Modules

- **5x5 Strength Hub**: Specialized tracker for Workout A/B routines with automatic progressive overload calculation.
- **Activity Log**: Generic logging for any activity (Skipping, Yoga, Cardio) with the ability to add custom exercises on the fly.
- **AI Coach**: Integrated Google Gemini AI that provides form cues and instructional videos for major lifts.
- **Advanced Tools**: Built-in rest timer, warmup calculator, and weight micro-adjustment tools.
- **Visual Trends**: Progress charts and a comprehensive history log to visualize your consistency and gains.
- **Data Privacy**: All data is stored locally in your browser with simple Export/Import options for backups.

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS
- Lucide React Icons
- Recharts Visualization
- Google GenAI (Gemini API)

## Data Persistence

**Your data is automatically saved!** Tizi Tracker uses browser localStorage to remember:

- ✅ All workout history
- ✅ Current weights for each exercise
- ✅ Next workout (A or B alternation)
- ✅ Your preferences (units, etc.)

**The app remembers:**
- **Yesterday's workout** - See what you did last time on the dashboard
- **Tomorrow's plan** - The dashboard shows what exercises and weights are coming up next
- **Full history** - View all past workouts in the History tab
- **Progress trends** - Visual charts show your strength progression over time

**Backup your data:**
- Settings → Export Data (downloads JSON file)
- Settings → Import Data (restore from backup)

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

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on:
- Deploying to Vercel/Netlify (free hosting)
- Setting up GitHub Pages
- Accessing via local network
- Self-hosting options

## Debugging & Monitoring

Need to debug the app on your phone or share issues with developers?

- 🔍 [Remote Debugging Guide](./REMOTE_DEBUGGING.md) - Connect your phone for debugging
- 📱 Chrome Remote Debugging (Android)
- 🍎 Safari Web Inspector (iOS)
- 🌐 ngrok for sharing your local dev server
- 📊 Enhanced console logging for easier troubleshooting

## Contributing

Found a bug? Have a feature idea? Want to help improve Tizi Tracker?

- 📋 [Report Issues](https://github.com/jgathogo/Tizi-Log-Tizi-Tracker/issues)
- 💡 [Suggest Enhancements](https://github.com/jgathogo/Tizi-Log-Tizi-Tracker/issues/new)
- 📖 [Contributing Guide](./CONTRIBUTING.md)

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Re-creating This App (AI Prompt)

> "Build a React-based fitness logger called 'Tizi Tracker'. The app should be a versatile activity tracker with a specialized module for 5x5 lifting programs. 
> 
> **Dashboard:** Features a 'Quick Start' for the next 5x5 session and an 'Activity Hub' for custom logging (e.g., Skipping, Running).
> **Workout View:** Interactive exercise cards with set trackers. For 5x5 lifts, include a warmup calculator and AI form guide (Gemini API). For custom logs, allow adding new exercises dynamically.
> **Logic:** Automatic progression for successful 5x5 sets, manual weight micro-adjustments (+/- 1.25kg, etc.), and a persistent rest timer.
> **Data:** History view with total volume metrics, Trend charts using Recharts, and JSON Export/Import for backups. 
> **UI:** Dark slate and blue theme with high-quality rounded corners and smooth transitions."
