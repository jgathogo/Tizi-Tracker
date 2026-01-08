# Firebase Setup Verification Checklist

## Step 1: Verify Firestore Database Exists

1. In Firebase Console, click **"Firestore Database"** in the left sidebar
2. You should see one of two things:

### ✅ If Database Exists:
- You'll see an empty database with "Start collection" or existing collections
- **You're good!** Proceed to Step 2

### ❌ If Database Doesn't Exist:
- You'll see "Create database" button
- Click **"Create database"**
- Choose **"Start in test mode"** (we'll add security rules later)
- Select your region (choose closest to your users)
- Click **"Enable"**
- Wait for database to be created (30-60 seconds)

## Step 2: Verify Authentication is Enabled

1. In Firebase Console, click **"Authentication"** in the left sidebar
2. You should see "Get started" or a list of sign-in methods

### ✅ If Already Enabled:
- You'll see a list of sign-in methods
- **Skip to Step 3**

### ❌ If Not Enabled:
- Click **"Get started"**
- Then click the **"Sign-in method"** tab
- Enable **"Google"**:
  - Click "Google"
  - Toggle "Enable"
  - Enter project support email
  - Click "Save"
- Enable **"Email/Password"**:
  - Click "Email/Password"
  - Toggle "Enable"
  - Click "Save"

## Step 3: Check Browser Console

1. Make sure your dev server is running (`npm run dev`)
2. Open `http://localhost:3000` in your browser
3. Open browser console (F12 → Console tab)
4. Look for one of these messages:

### ✅ Success:
```
✅ Firebase initialized successfully
```

### ❌ Not Configured:
```
⚠️ Firebase not configured. Cloud sync will be disabled.
```

### ❌ Error:
```
❌ Firebase initialization error: [error message]
```

## Step 4: Test Firebase is Working

If you see "✅ Firebase initialized successfully", try this in the browser console:

```javascript
// Check if Firebase is initialized
console.log('Firebase App:', window.firebaseApp);
console.log('Firebase Auth:', window.firebaseAuth);
console.log('Firebase DB:', window.firebaseDB);
```

Or check if Firebase is available:
```javascript
import { isFirebaseConfigured } from './services/firebaseConfig';
console.log('Firebase configured:', isFirebaseConfigured());
```

## Troubleshooting

### No console messages at all?
- Check browser console for JavaScript errors
- Make sure you saved the firebaseConfig.ts file
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### "Firebase not configured" warning?
- Check that firebaseConfig.ts has your actual values (not placeholders)
- Verify the config values match what's in Firebase Console

### Initialization error?
- Check browser console for the specific error
- Verify all config values are correct
- Make sure Firestore database exists

## Next Steps After Verification

Once you see "✅ Firebase initialized successfully":

1. ✅ Firestore Database created
2. ✅ Authentication enabled (Google + Email/Password)
3. ✅ Firebase initialized in app
4. Next: Test authentication (sign in/sign up)
5. Next: Test data sync (save/load)

