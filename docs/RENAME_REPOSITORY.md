# Renaming GitHub Repository to Tizi-Tracker

## Current Status
- **Current Repository Name:** `Tizi-Tracker` ✅
- **Previous Repository Name:** `Tizi-Log-Tizi-Tracker` (deprecated)
- **GitHub URL:** https://github.com/jgathogo/Tizi-Tracker

## How to Rename on GitHub

### Option 1: Using GitHub Web Interface (Recommended)

1. **Go to your repository:**
   - Visit: https://github.com/jgathogo/Tizi-Tracker

2. **Click Settings:**
   - Click the "Settings" tab at the top of the repository

3. **Scroll to Repository Name:**
   - Scroll down to the "Repository name" section

4. **Rename:**
   - Change from: `Tizi-Log-Tizi-Tracker` (if not already renamed)
   - Change to: `Tizi-Tracker`
   - Click "Rename" button
   
**Note:** Repository has been renamed. All code and documentation references have been updated.

5. **GitHub will:**
   - ✅ Update the repository name
   - ✅ Redirect old URLs to new ones (for 90 days)
   - ✅ Update all references automatically

### Option 2: Using GitHub CLI

```bash
# If repository hasn't been renamed yet:
gh repo rename Tizi-Tracker --repo jgathogo/Tizi-Log-Tizi-Tracker

# If already renamed, verify:
gh repo view jgathogo/Tizi-Tracker
```

## After Renaming: Update Local Repository

After renaming on GitHub, update your local repository's remote URL:

```bash
cd /home/james/Documents/Tizi-Tracker
git remote set-url origin https://github.com/jgathogo/Tizi-Tracker.git
git remote -v  # Verify the change
```

## Optional: Rename Local Folder

If you want to rename the local folder to match:

```bash
# From parent directory (if local folder hasn't been renamed)
cd /home/james/Documents
mv Tizi-Log-Tizi-Tracker Tizi-Tracker
cd Tizi-Tracker

# Note: Local folder is already named Tizi-Tracker
```

**Note:** This is optional - the folder name doesn't affect functionality.

## Update Deployment URLs

If you've deployed to Vercel or other services, you may need to:

1. **Vercel:**
   - Go to project settings
   - Update repository connection if needed
   - The deployment should auto-update

2. **Documentation:**
   - Update any hardcoded URLs in documentation
   - Most references should auto-update via GitHub redirects

## Verify Everything Works

After renaming:

```bash
# Test git operations
git fetch
git status

# Verify remote URL
git remote -v
```

## Important Notes

- ✅ **Old URLs will redirect** - GitHub automatically redirects old repository URLs for 90 days
- ✅ **Clones will still work** - Existing clones can update their remote URL
- ✅ **Issues/PRs preserved** - All issues, PRs, and history remain intact
- ⚠️ **Bookmarks** - Update any bookmarks or links you've saved
- ⚠️ **CI/CD** - Update any CI/CD configurations that reference the old name

## Recommended Repository Name

**`Tizi-Tracker`** - Simple, clean, matches the app name.

Alternative options:
- `tizi-tracker` (lowercase, more URL-friendly)
- `TiziTracker` (no hyphens)

---

**Ready to rename?** Follow the steps above, or I can help you do it via GitHub CLI if you're authenticated.

