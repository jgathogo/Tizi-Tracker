# Fix: Firebase "Unauthorized Domain" Error on Phone

## The Problem

When you try to sign in on your phone, you get:
```
Firebase: Error (auth/unauthorized-domain)
```

This happens because Firebase requires you to **whitelist** the domain/URL where your app is being accessed.

## Quick Fix: Add Your Domain to Firebase

### Step 1: Find Your App's URL

**Check your phone's browser address bar** to see the exact URL you're accessing:

- **Local network**: `http://192.168.x.x:3000` (your computer's IP)
- **Vercel preview**: `https://tizi-tracker-*.vercel.app`
- **Vercel production**: `https://tizi-tracker.vercel.app`
- **Other**: Check your deployment URL

### Step 2: Add Domain to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **tizi** (tizi-d2ab1)
3. Click **Authentication** in the left sidebar
4. Click **Settings** tab (gear icon ⚙️ at the top)
5. Scroll down to **Authorized domains** section
6. You'll see existing domains:
   - `localhost` (for local development on computer)
   - `tizi-d2ab1.firebaseapp.com` (Firebase default)
   - `tizi-d2ab1.web.app` (Firebase default)

7. Click **"Add domain"** button
8. Enter your domain (see examples below)

### Step 3: Domain Examples

#### For Local Network (Phone on same WiFi as computer):

**If accessing via:** `http://192.168.100.59:3000`

**Add to Firebase:** `192.168.100.59` (NO port, NO http://)

**Important:**
- ✅ Add: `192.168.100.59`
- ❌ DON'T add: `192.168.100.59:3000`
- ❌ DON'T add: `http://192.168.100.59`

#### For Vercel Deployment:

**If your app URL is:** `https://tizi-tracker.vercel.app`

**Add to Firebase:** `tizi-tracker.vercel.app` (NO https://)

#### For Netlify:

**If your app URL is:** `https://your-app.netlify.app`

**Add to Firebase:** `your-app.netlify.app` (NO https://)

### Step 4: Rules for Adding Domains

- ✅ **Domain only** - No `http://` or `https://`
- ✅ **No port numbers** - `192.168.100.59` not `192.168.100.59:3000`
- ✅ **IP addresses OK** - You can add local IPs like `192.168.1.100`
- ✅ **Subdomains OK** - `tizi-tracker.vercel.app`, `app.example.com`

### Step 5: Find Your Computer's Local IP

If you're accessing from phone via local network, find your IP:

```bash
# On Linux
hostname -I | awk '{print $1}'

# Or
ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1 | head -1
```

This will show something like: `192.168.100.59`

**Add this IP to Firebase** (without port).

### Step 6: Try Again

1. **Clear browser cache** on your phone (optional but recommended)
2. **Close and reopen** the app on your phone
3. **Try signing in again**

## Common Scenarios

### Scenario 1: Testing Locally on Phone (Same WiFi)

1. Your computer's IP: `192.168.100.59`
2. You access: `http://192.168.100.59:3000` on phone
3. Add to Firebase: `192.168.100.59`
4. Try signing in

### Scenario 2: Deployed to Vercel

1. Your app URL: `https://tizi-tracker-abc123.vercel.app`
2. Add to Firebase: `tizi-tracker-abc123.vercel.app`
3. Also add production domain: `tizi-tracker.vercel.app` (if you have one)

### Scenario 3: Custom Domain

1. Your domain: `https://tizi-tracker.com`
2. Add to Firebase: `tizi-tracker.com`

## Still Not Working?

1. **Double-check the exact URL** - Look at your phone's browser address bar
2. **Verify in Firebase Console** - Make sure domain appears in the list
3. **Check for typos** - Domain must match exactly
4. **Clear cache** - Clear browser cache on phone
5. **Hard refresh** - Close app completely and reopen

## Security Note

Firebase API keys are meant to be public (client-side). The authorized domains list prevents unauthorized sites from using your Firebase project. Only add domains you actually use!

