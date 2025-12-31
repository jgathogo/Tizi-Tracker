# Deploying Tizi Tracker to Your Phone

This guide covers multiple ways to access Tizi Tracker on your mobile device.

## Option 1: Deploy to Vercel/Netlify (Recommended - Free & Easy)

### Using Vercel (Recommended)

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy using npx (no installation needed):**
   ```bash
   npx vercel
   ```
   
   **Alternative:** If you prefer to install globally:
   ```bash
   npm i -g vercel  # May require sudo on Linux
   vercel
   ```
   Follow the prompts. Your app will be live at `https://your-app.vercel.app`

4. **Add to phone home screen:**
   - Open the URL on your phone
   - iOS: Tap Share → Add to Home Screen
   - Android: Menu → Add to Home Screen

### Using Netlify

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod --dir=dist
   ```

## Option 2: GitHub Pages (Free)

1. **Update `vite.config.ts`** to add base path:
   ```typescript
   export default defineConfig({
     base: '/Tizi-Tracker/', // Your repo name
     // ... rest of config
   })
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Push `dist` folder to `gh-pages` branch:**
   ```bash
   git subtree push --prefix dist origin gh-pages
   ```

4. **Enable GitHub Pages** in repo settings → Pages → Source: `gh-pages` branch

5. **Access at:** `https://yourusername.github.io/Tizi-Tracker/`

## Option 3: Local Network Access (Development)

1. **Start dev server with network access:**
   ```bash
   npm run dev
   ```

2. **Find your local IP:**
   ```bash
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```

3. **Access from phone:** `http://YOUR_IP:3000`

   **Note:** Both devices must be on the same WiFi network.

## Option 4: Self-Hosted (Advanced)

Deploy to your own server (VPS, Raspberry Pi, etc.):

1. **Build:**
   ```bash
   npm run build
   ```

2. **Serve `dist` folder** with nginx, Apache, or any static file server

3. **Configure HTTPS** (required for PWA features)

## PWA (Progressive Web App) Features

The app works as a PWA - you can install it on your phone for an app-like experience:

- **Offline support** (data stored locally)
- **Home screen icon**
- **Full-screen experience**
- **No app store needed**

## Data Sync Between Devices

Currently, data is stored locally in each browser. To sync:

1. **Export data** from one device (Settings → Export)
2. **Import data** on another device (Settings → Import)

**Future enhancement:** Consider adding cloud sync via Firebase or similar service.

