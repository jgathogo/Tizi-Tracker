# Remote Debugging & Monitoring Guide

This guide helps you debug and monitor Tizi Tracker on your phone so you can share issues with developers.

## Option 1: Chrome Remote Debugging (Android) - Recommended

### Setup

1. **Enable USB Debugging on Android:**
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable "USB Debugging"

2. **Connect phone to computer via USB**

3. **On your computer, open Chrome:**
   ```
   chrome://inspect
   ```

4. **Your phone will appear** - Click "Inspect" to see:
   - Console logs
   - Network requests
   - React DevTools
   - Performance metrics
   - LocalStorage data

### What You Can Share

- **Console Errors:** Copy/paste from Console tab
- **Screenshots:** Take screenshots of the app
- **Network Tab:** See if API calls are failing
- **Application Tab:** Check localStorage data

## Option 2: Safari Web Inspector (iOS)

### Setup

1. **Enable Web Inspector on iPhone:**
   - Settings → Safari → Advanced → Web Inspector (ON)

2. **Connect iPhone to Mac via USB**

3. **On Mac, open Safari:**
   - Safari → Develop → [Your iPhone] → [Tizi Tracker URL]

4. **Web Inspector opens** - Same features as Chrome DevTools

## Option 3: Remote Access via ngrok (Share with Developers)

### Setup

1. **Install ngrok:**
   ```bash
   # Download from https://ngrok.com/download
   # Or via package manager
   sudo apt install ngrok  # Linux
   brew install ngrok      # Mac
   ```

2. **Start your dev server:**
   ```bash
   npm run dev
   ```

3. **In another terminal, expose it:**
   ```bash
   ngrok http 3000
   ```

4. **You'll get a public URL like:**
   ```
   https://abc123.ngrok.io
   ```

5. **Share this URL** - Anyone can access your app (while ngrok is running)

6. **Access from phone:**
   - Open the ngrok URL in your phone's browser
   - Add to home screen for app-like experience

### Security Note
- ngrok URLs are temporary (free tier)
- Anyone with the URL can access your app
- Don't share sensitive data while testing

## Option 4: Deploy to Public URL (Best for Testing)

### Quick Deploy to Vercel

1. **Build and deploy:**
   ```bash
   npm run build
   npx vercel --prod
   ```

2. **Get public URL** (e.g., `https://tizi-tracker.vercel.app`)

3. **Share URL** - Developers can:
   - Access the app
   - See console errors
   - Test on their devices
   - Debug issues

## Option 5: Browser Console Logging (No Setup Needed)

### Add Debug Logging

The app can log important events. Check browser console:

1. **On your phone, open the app**
2. **Open browser console:**
   - Chrome Android: chrome://inspect (from computer)
   - Safari iOS: Safari Web Inspector (from Mac)
   - Or use remote debugging (Options 1-2)

3. **Look for logs:**
   - Workout started/completed
   - Data saved/loaded
   - Errors

## Option 6: Screenshot & Video Recording

### Quick Way to Share Issues

1. **Take screenshots** of:
   - Error messages
   - Unexpected behavior
   - What you expected vs. what happened

2. **Record screen** (if possible):
   - Android: Built-in screen recorder
   - iOS: Screen Recording in Control Center

3. **Share with:**
   - Screenshots
   - Video recording
   - Description of the issue

## What Information to Share

When reporting issues, include:

1. **Console Errors:**
   ```
   Open DevTools → Console tab → Copy errors
   ```

2. **Browser Info:**
   - Browser name and version
   - Device model
   - OS version

3. **Steps to Reproduce:**
   - What you did
   - What happened
   - What you expected

4. **Screenshots/Videos:**
   - Visual proof of the issue

5. **Network Tab:**
   - If API calls are failing
   - Check "Network" tab in DevTools

## Quick Debug Checklist

- [ ] Console has no errors
- [ ] Data is saving (check localStorage)
- [ ] Network requests succeed
- [ ] App loads correctly
- [ ] All buttons work
- [ ] Data persists after refresh

## For Developers: Accessing User's App

If a user shares their ngrok URL or deployed URL:

1. **Open the URL** in your browser
2. **Open DevTools** (F12)
3. **Check Console** for errors
4. **Check Network** for failed requests
5. **Check Application** → LocalStorage for data
6. **Test functionality** yourself

## Troubleshooting

### "Device not showing in chrome://inspect"
- Make sure USB debugging is enabled
- Try different USB cable
- Install device drivers
- Restart Chrome

### "ngrok not working"
- Check if port 3000 is correct
- Make sure dev server is running
- Check firewall settings

### "Can't see console on phone"
- Use remote debugging (Options 1-2)
- Or deploy to public URL (Option 4)

