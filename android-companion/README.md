# Tizi Health Sync — Android Companion App

This Android app syncs your **Tizi Tracker** workout history from Firebase to **Health Connect**. It works only when you use the same Firebase project and sign in with the same Google account as in the Tizi Tracker PWA.

## What it does

- **One-way sync**: Completed workouts from Tizi Tracker (saved to Firestore) are written to Health Connect as exercise sessions.
- **Manual sync**: Use “Sync now” on the main screen to sync immediately.
- **Background sync**: WorkManager runs a sync about every hour when the app is installed (no need to open the app).

## Requirements

- **Android 9+** (API 28+). Health Connect is built-in on Android 14+; on older versions you may need to install the [Health Connect app](https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata) from the Play Store.
- **Firebase**: Tizi Tracker must be using Firebase cloud sync and you must be signed in there with a Google account.
- **Same Firebase project**: The app uses the same Firestore data as the Tizi Tracker PWA (`users/{uid}`).

## Setup

### 1. Firebase project

Use the **same** Firebase project as your Tizi Tracker PWA.

1. In [Firebase Console](https://console.firebase.google.com/), open your project.
2. If you have not already, add an **Android app**:
   - Project settings (gear) → Your apps → Add app → Android.
   - Use package name: `com.tizitracker.healthsync`.
   - Download `google-services.json`.
3. Put `google-services.json` in this directory:  
   `android-companion/app/google-services.json`  
   (so the path is `android-companion/app/google-services.json`).
4. Enable **Authentication** → Sign-in method → **Google**.
5. Ensure **Firestore** is set up and your Tizi Tracker PWA is syncing (e.g. `users/{uid}` with workout history).

### 2. Web Client ID (for Google Sign-In)

The app needs the **Web client ID** from the same Firebase project for Google Sign-In.

1. In Firebase Console: Project settings → Your apps → select your **Web** app (or create one).
2. Copy the **Web client ID** (e.g. `123456789-xxx.apps.googleusercontent.com`).
3. In the Android project, open `app/src/main/res/values/strings.xml`.
4. Replace `YOUR_WEB_CLIENT_ID` with that value:

   ```xml
   <string name="default_web_client_id" translatable="false">YOUR_ACTUAL_WEB_CLIENT_ID</string>
   ```

### 3. Health Connect

- On first run, the app will ask for Health Connect permissions (exercise and calories). Grant them so workouts can be written.
- You can also open **Settings → Health Connect** and allow “Tizi Health Sync” to write exercise data.

### 4. Build and run

- **Recommended**: Open the `android-companion` folder in **Android Studio**, then Build → Make Project and run on a device or emulator with Health Connect available.
- **Command line**: If the Gradle wrapper is present, run `./gradlew assembleDebug` from the `android-companion` directory. If not, sync the project in Android Studio once (File → Sync Project with Gradle Files) to generate it.

## Usage

1. Open **Tizi Health Sync** and tap **Sign in with Google**.
2. Sign in with the **same** Google account you use in Tizi Tracker (with cloud sync on).
3. Grant Health Connect permissions when prompted.
4. Tap **Sync now** to sync completed workouts to Health Connect. Future runs will only add new workouts (already-synced ones are skipped).
5. Optional: leave the app; background sync will run about every hour.

## Data and privacy

- Workout data is read from your Firebase Firestore (`users/{uid}`) and written only to Health Connect on the same device.
- No workout data is sent to any server other than Firebase (which you already use with Tizi Tracker).
- Health Connect data stays on the device and is governed by Android’s Health Connect and system privacy settings.

## Troubleshooting

- **“Health Connect not available”**  
  Install or update the Health Connect app from the Play Store if you’re on Android 9–13.

- **“Not signed in”**  
  Sign in with the same Google account you use in Tizi Tracker and ensure cloud sync is enabled there.

- **No workouts syncing**  
  Make sure workouts are **completed** in Tizi Tracker and that the app has synced to Firebase (e.g. open Tizi Tracker while online so it can upload).

- **Google Sign-In fails**  
  Confirm the Web client ID in `strings.xml` matches the Web app in your Firebase project and that Google sign-in is enabled in the Firebase Authentication settings.
