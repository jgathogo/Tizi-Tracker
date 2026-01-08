# Firebase Setup Guide

This guide will help you set up Firebase for cloud sync functionality in Tizi Tracker.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or "Create a project"
3. Enter project name: `tizi-tracker` (or your preferred name)
4. Disable Google Analytics (optional, not needed for basic setup)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Enable the following providers:
   - **Google**: Click "Google", toggle "Enable", enter project support email, click "Save"
   - **Email/Password**: Click "Email/Password", toggle "Enable", click "Save"

## Step 3: Create Firestore Database

1. In Firebase Console, go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (for development)
3. Select a location (choose closest to your users)
4. Click "Enable"

### Set Up Security Rules (Important!)

1. Go to **Firestore Database** → **Rules**
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

## Step 4: Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ → **Project settings**
2. Scroll down to **Your apps** section
3. Click the web icon `</>` to add a web app
4. Register app with nickname: "Tizi Tracker Web"
5. Copy the `firebaseConfig` object

## Step 5: Configure in Tizi Tracker

### Option A: Environment Variables (Recommended for Production)

1. Create a `.env` file in the project root:

```bash
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

2. Replace the values with your actual Firebase config

### Option B: Direct Configuration (For Development)

1. Open `services/firebaseConfig.ts`
2. Replace the placeholder values in `firebaseConfig` object with your actual values:

```typescript
const firebaseConfig = {
  apiKey: 'your-actual-api-key',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: '123456789',
  appId: 'your-actual-app-id'
};
```

## Step 6: Test the Setup

1. Start the development server: `npm run dev`
2. Open the app in your browser
3. Go to Settings
4. You should see "Cloud Sync" section
5. Try signing in with Google or Email/Password
6. Your data should sync to Firestore

## Verification

1. In Firebase Console → **Firestore Database**
2. You should see a `users` collection
3. Each user will have a document with their `userId`
4. The document contains their workout profile data

## Troubleshooting

### "Firebase not configured" warning
- Check that you've added your Firebase config values
- Restart the dev server after adding environment variables

### Authentication not working
- Verify Authentication is enabled in Firebase Console
- Check that Google Sign-In is enabled
- Verify Email/Password is enabled

### Data not syncing
- Check browser console for errors
- Verify Firestore security rules allow authenticated users
- Check that you're signed in (look for user icon in Settings)

### CORS errors
- Firebase should handle CORS automatically
- If issues persist, check Firebase project settings

## Security Notes

- **Never commit** `.env` file or Firebase config with real values to git
- Add `.env` to `.gitignore`
- Use environment variables in production
- Keep Firestore security rules strict (only allow users to access their own data)

## Free Tier Limits

Firebase Spark (Free) Plan includes:
- 50,000 reads/day
- 20,000 writes/day
- 1GB storage
- Unlimited authentication

This is sufficient for thousands of users!

## Next Steps

Once Firebase is configured:
1. Users can sign in via Settings → Cloud Sync
2. Data automatically syncs when online
3. Data works offline and syncs when connection is restored
4. Users can access their data from any device

