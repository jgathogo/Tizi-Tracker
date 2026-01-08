# How Data Loss Can Happen on Any Device

## Understanding Browser localStorage

Tizi Tracker stores all your workout data in your browser's **localStorage**. This is a local storage mechanism that keeps data on your device, but it's not permanent and can be lost in several scenarios.

## Common Causes of Data Loss

### 1. **Browser Cache/Storage Clearing**
- **What happens**: When you clear browser cache or storage (Settings → Clear browsing data)
- **Why**: Users often clear cache to free up space or fix issues, not realizing it deletes app data
- **Prevention**: Regular backups using the "Save Backup" button

### 2. **Private/Incognito Mode**
- **What happens**: Data stored in private browsing is deleted when you close the browser
- **Why**: Private mode is designed to not persist data
- **Prevention**: Don't use Tizi Tracker in private/incognito mode

### 3. **Browser Updates**
- **What happens**: Some browser updates can clear localStorage (rare but possible)
- **Why**: Major browser version updates sometimes reset storage
- **Prevention**: Backup before major updates

### 4. **Different URL/Domain**
- **What happens**: If you access the app from a different URL (e.g., `http://` vs `https://`, or different subdomain)
- **Why**: localStorage is domain-specific - different domains = different storage
- **Prevention**: Always use the same URL to access the app

### 5. **Browser Uninstall/Reinstall**
- **What happens**: Uninstalling and reinstalling the browser clears all localStorage
- **Why**: Reinstall = fresh start
- **Prevention**: Export data before uninstalling

### 6. **Device Factory Reset**
- **What happens**: Factory reset erases all app data including browser storage
- **Why**: Factory reset = complete wipe
- **Prevention**: Backup to cloud/external storage before reset

### 7. **Storage Quota Exceeded**
- **What happens**: If browser storage is full, older data might be deleted
- **Why**: Browsers have storage limits (usually 5-10MB for localStorage)
- **Prevention**: Regular backups, browser will warn before quota issues

### 8. **JavaScript Errors During Migration**
- **What happens**: If app code has a bug during data migration, data might not load correctly
- **Why**: Code errors can prevent data from being read, even if it still exists
- **Prevention**: Regular backups, app updates fix bugs

### 9. **Browser Security Settings**
- **What happens**: Some security settings or extensions block localStorage
- **Why**: Privacy-focused browsers/extensions may restrict storage
- **Prevention**: Check browser settings, use standard browsers

### 10. **Multiple Devices/Browsers**
- **What happens**: Data on Phone A is different from Phone B (they don't sync)
- **Why**: localStorage is device/browser-specific, not cloud-synced
- **Prevention**: Export from one device, import to another

## How to Protect Your Data

### ✅ **Best Practices**

1. **Regular Manual Backups**
   - Click the green "Save Backup" button on the dashboard
   - Do this weekly or after important workouts
   - Save backups to cloud storage (Google Drive, iCloud, etc.)

2. **Automatic Backups**
   - The app now automatically creates a backup after each workout completion
   - Check your Downloads folder for `tizi_tracker_backup_YYYY-MM-DD.json` files

3. **Multiple Backup Locations**
   - Don't keep backups only on your phone
   - Upload to cloud storage
   - Email backups to yourself
   - Keep backups on computer too

4. **Before Major Changes**
   - Backup before browser updates
   - Backup before device updates
   - Backup before factory reset
   - Backup before clearing browser data

5. **Use the Same URL**
   - Always access Tizi Tracker from the same URL
   - Bookmark the exact URL you use
   - Don't switch between `http://` and `https://`

## How the New Backup System Works

### **Manual Backup Button**
- **Location**: Green download button in the top-right of dashboard
- **Action**: Immediately downloads a JSON file with all your data
- **When to use**: Anytime you want to save your data

### **Automatic Backup**
- **Trigger**: After completing any workout
- **Location**: Downloads folder on your device
- **Filename**: `tizi_tracker_backup_YYYY-MM-DD.json`
- **Silent**: Happens automatically, no prompt needed

### **Backup Reminder**
- **Shows**: If no backup exists OR if last backup is >7 days old
- **Location**: Yellow banner at top of dashboard
- **Action**: Click "Save Backup Now" to create a backup

## Restoring from Backup

1. Open Tizi Tracker
2. Go to **Settings** (gear icon)
3. Click **"Import Data"**
4. Select your backup JSON file
5. Your data will be restored!

## Technical Details

### Why localStorage Can Be Lost

localStorage is **not**:
- ❌ Permanent storage (can be cleared)
- ❌ Synced across devices
- ❌ Backed up automatically
- ❌ Protected from browser actions

localStorage **is**:
- ✅ Fast and convenient
- ✅ Works offline
- ✅ No server required
- ✅ Private (stays on your device)

### Why We Use localStorage

- **Privacy**: Your data never leaves your device
- **Offline**: Works without internet
- **Speed**: Instant access, no loading
- **Simplicity**: No accounts or servers needed

### Future Improvements

We're considering:
- Cloud sync option (optional)
- Automatic cloud backups
- Multiple backup slots
- Backup scheduling

For now, **regular manual backups are the best protection**.

## Summary

**Data loss can happen on ANY device** because:
- Browser storage is temporary by design
- Users can clear it accidentally
- Updates and changes can wipe it
- It's device-specific, not synced

**Protect yourself by**:
- ✅ Using the backup button regularly
- ✅ Saving backups to cloud storage
- ✅ Keeping multiple backup copies
- ✅ Backing up before major changes

**Remember**: The backup button is your friend! Use it often! 💾


