# Cache Busting System - User Guide

This cache-busting system ensures that when you update your website files on GitHub, mobile browsers will automatically fetch the latest version without requiring users to manually clear their browser cache.

## How It Works

1. **Version Tracking**: A `version.json` file tracks the current version of your website
2. **Automatic Detection**: The `cache-buster.js` script periodically checks for version updates
3. **Auto-Reload**: When a new version is detected, users see a notification and the page automatically reloads
4. **Cache Control**: HTML meta tags prevent aggressive caching

## Quick Start

### When You Update Your Website:

1. **Update the version number:**
   ```bash
   node update-version.js
   ```
   This increments the patch version (e.g., 1.0.0 → 1.0.1)

   For major or minor updates:
   ```bash
   node update-version.js major   # 1.0.0 → 2.0.0
   node update-version.js minor   # 1.0.0 → 1.1.0
   node update-version.js patch   # 1.0.0 → 1.0.1 (default)
   ```

2. **Update HTML files with new version:**
   ```bash
   node update-html-versions.js
   ```
   This automatically updates all version query parameters in your HTML files.

3. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Update website - version bump"
   git push
   ```

4. **Done!** Mobile users will automatically get the update when they refresh or when the system detects the new version.

## Files Included

- **`version.json`** - Stores the current version number
- **`cache-buster.js`** - Automatically checks for updates and reloads the page
- **`update-version.js`** - Script to increment the version number
- **`update-html-versions.js`** - Script to update version in all HTML files

## How Users Experience Updates

1. User visits your website on mobile
2. The cache-buster script runs in the background
3. Every 60 seconds, it checks for a new version
4. If a new version is detected:
   - A notification appears: "New version available! Updating..."
   - After 2 seconds, the page automatically reloads
   - All cached files are bypassed
   - User sees the latest version

## Manual Update Check

Users can also manually trigger a version check by opening the browser console and running:
```javascript
checkVersionUpdate()
```

## Technical Details

### Cache Control Headers
All HTML files include these meta tags:
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

### Version Query Parameters
All CSS and JavaScript files include version query parameters:
```html
<link rel="stylesheet" href="styles.css?v=1.0.0">
<script src="app.js?v=1.0.0"></script>
```

When the version changes, browsers treat these as new files and fetch fresh copies.

## Troubleshooting

### Version not updating on mobile?

1. **Check version.json**: Make sure the version was updated and pushed to GitHub
2. **Check cache-buster.js**: Ensure it's included in all HTML files
3. **Check network**: Make sure the mobile device has internet connection
4. **Force refresh**: Users can manually refresh the page (pull down to refresh on mobile)

### HTML files not updating?

Make sure you run `update-html-versions.js` after updating the version:
```bash
node update-html-versions.js
```

## Best Practices

1. **Update version before every deployment** - Always increment the version when pushing updates
2. **Test locally first** - Update version, test locally, then push to GitHub
3. **Use semantic versioning**:
   - **Patch** (1.0.0 → 1.0.1): Bug fixes, small changes
   - **Minor** (1.0.0 → 1.1.0): New features, backward compatible
   - **Major** (1.0.0 → 2.0.0): Breaking changes, major updates

## Example Workflow

```bash
# 1. Make your changes to the website files
# ... edit files ...

# 2. Update version
node update-version.js

# 3. Update HTML files
node update-html-versions.js

# 4. Commit and push
git add .
git commit -m "Add new feature - version 1.1.0"
git push

# 5. Mobile users will automatically get the update!
```

## Notes

- The system checks for updates every 60 seconds
- Updates are also checked when the page becomes visible (user switches back to tab)
- The notification appears for 2 seconds before reloading
- All browser caches are cleared before reloading

---

**Need Help?** If you encounter any issues, check that:
- All files are properly committed to GitHub
- The version.json file is accessible (not blocked by server)
- Mobile browsers have JavaScript enabled
- The cache-buster.js file is loading correctly




