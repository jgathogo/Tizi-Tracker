# Data Recovery Guide

If your workout logs appear to be missing after an update, your data is likely still in your browser's localStorage. Follow these steps to recover it.

## Quick Recovery Steps

### Option 1: Check Browser Console (Easiest)

1. **On your phone, open the Tizi Tracker app**
2. **Open browser developer tools:**
   - **Chrome/Edge on Android**: 
     - Connect phone to computer via USB
     - Enable USB debugging on phone
     - Open `chrome://inspect` on desktop Chrome
     - Click "Inspect" on your device
   - **Samsung Internet**:
     - Settings → Advanced → Remote debugging
     - Connect via USB and use Chrome DevTools
   - **Safari on iOS**:
     - Settings → Safari → Advanced → Web Inspector
     - Connect to Mac and use Safari Web Inspector

3. **In the Console tab, run these commands:**

```javascript
// Check if data exists
const data1 = localStorage.getItem('tizi_tracker_data');
const data2 = localStorage.getItem('powerlifts_data');

console.log('tizi_tracker_data exists:', !!data1);
console.log('powerlifts_data exists:', !!data2);

if (data1) {
  const parsed = JSON.parse(data1);
  console.log('History count:', parsed.history?.length || 0);
  console.log('Last workout:', parsed.history?.[0]?.date);
}

// Export data to clipboard (copy this output)
if (data1 || data2) {
  const data = data1 || data2;
  console.log('--- COPY THIS DATA ---');
  console.log(data);
  console.log('--- END DATA ---');
}
```

### Option 2: Manual Recovery via Settings (If App Still Works)

1. **Open Tizi Tracker on your phone**
2. **Go to Settings** (gear icon)
3. **Click "Export Data"** - this will download a backup file
4. **If the app shows empty data**, the export might still contain your old data
5. **Save the exported file somewhere safe**

### Option 3: Direct localStorage Access (Advanced)

If you can access the browser console, you can manually export your data:

```javascript
// Get all data
const allData = localStorage.getItem('tizi_tracker_data') || localStorage.getItem('powerlifts_data');

if (allData) {
  // Create download link
  const blob = new Blob([allData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tizi_recovery_' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  console.log('✅ Backup file downloaded!');
} else {
  console.log('❌ No data found in localStorage');
}
```

### Option 4: Check Browser Storage Directly

**On Android (Chrome/Samsung Internet):**
1. Open browser settings
2. Go to "Site settings" or "Storage"
3. Find your Tizi Tracker site
4. Check "Storage used" - if it shows data, it's still there!

**On iOS (Safari):**
1. Settings → Safari → Advanced → Website Data
2. Find your Tizi Tracker site
3. Check the storage size

## If Data is Found

Once you have your data (either from console or export):

1. **Save it as a JSON file** (e.g., `tizi_backup.json`)
2. **In the app, go to Settings → Import Data**
3. **Select the JSON file**
4. **Your data should be restored!**

## If Data is Truly Lost

If localStorage is empty and you don't have a backup:

1. **Check if you exported data before** - look for files named `tizilog_backup_*.json`
2. **Check browser history** - sometimes cached data can be recovered
3. **Contact support** - if you have any screenshots or notes about your workouts, we might be able to help reconstruct them

## Prevention for Future

**Always export your data regularly:**
- Settings → Export Data (creates a backup file)
- Store backups in cloud storage (Google Drive, iCloud, etc.)
- Export after every few workouts or weekly

## Common Causes of "Lost" Data

1. **JavaScript Error**: The app might have an error preventing data from loading, but data is still in localStorage
2. **Cache Issue**: Browser cache might need clearing, but data persists in localStorage
3. **Different URL/Domain**: If you're accessing the app from a different URL, it uses different localStorage
4. **Browser Update**: Some browser updates can clear localStorage (rare)

## Need Help?

If you're stuck, try:
1. **Hard refresh**: Clear browser cache and reload
2. **Try a different browser**: Sometimes switching browsers helps
3. **Check network**: Make sure you're accessing the same URL as before



