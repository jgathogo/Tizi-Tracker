# Theme Debugging Guide

## Step-by-Step Verification

### 1. Check if `data-theme` attribute is being set

**In Browser DevTools Console:**
```javascript
// Check current theme attribute
document.documentElement.getAttribute('data-theme')

// Should return: "dark", "light", "cupcake", etc.
```

**If it returns `null` or wrong value:**
- Theme switching is not working
- Check `applyTheme()` function in `utils/themeColors.ts`
- Verify `handleThemeChange` is being called

### 2. Check CSS Variables

**In Browser DevTools:**
1. Inspect the `<html>` element
2. Look at "Computed" styles
3. Check these CSS variables:

**For Dark Theme:**
- `--color-base-100` should be: `oklch(25.33% 0.016 252.42)`
- `--color-base-content` should be: `oklch(97.807% 0.029 256.847)`
- `--color-primary` should be: `oklch(58% 0.233 277.117)`

**For Light Theme:**
- `--color-base-100` should be: `oklch(100% 0 0)` (white)
- `--color-base-content` should be: `oklch(21% .006 285.885)` (dark)
- `--color-primary` should be: `oklch(45% .24 277.023)`

**If variables are wrong:**
- DaisyUI CSS might not be loading
- Check if `tailwind.config.js` has DaisyUI plugin
- Verify build includes DaisyUI styles

### 3. Test Theme Switching Manually

**In Browser Console:**
```javascript
// Switch to light theme
document.documentElement.setAttribute('data-theme', 'light');

// Switch to cupcake theme
document.documentElement.setAttribute('data-theme', 'cupcake');

// Switch back to dark
document.documentElement.setAttribute('data-theme', 'dark');
```

**If manual switching works but UI selector doesn't:**
- Issue is in React state management
- Check `handleThemeChange` function
- Verify `onThemeChange` prop is passed correctly

### 4. Check for CSS Conflicts

**In Browser DevTools:**
1. Inspect any element that should change color
2. Check "Computed" styles
3. Look for hardcoded colors overriding theme variables

**Common issues:**
- Hardcoded `background-color: white` or `color: black`
- Inline styles
- CSS specificity issues

### 5. Verify DaisyUI is Loaded

**In Browser Console:**
```javascript
// Check if DaisyUI CSS variables exist
getComputedStyle(document.documentElement).getPropertyValue('--color-base-100')

// Should return a color value, not empty
```

## Expected Behavior

### Dark Theme Selected:
- **Background**: Dark gray-blue (`oklch(25.33% 0.016 252.42)`)
- **Text**: Very light/white (`oklch(97.807% 0.029 256.847)`)
- **Primary buttons**: Purple-blue
- **Cards**: Slightly darker than background

### Light Theme Selected:
- **Background**: White (`oklch(100% 0 0)`)
- **Text**: Dark (`oklch(21% .006 285.885)`)
- **Primary buttons**: Purple-blue (different shade)
- **Cards**: Light gray

### Cupcake Theme Selected:
- **Background**: Light pink/cream
- **Text**: Dark
- **Primary buttons**: Pink/rose color
- **Cards**: Slightly different shade

## If All Themes Look the Same

1. **Check `data-theme` attribute** - Is it actually changing?
2. **Check CSS variables** - Are they different for each theme?
3. **Check for hardcoded colors** - Are there any `bg-slate-*` or `text-slate-*` classes still present?
4. **Check browser cache** - Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
5. **Check build** - Rebuild the app: `npm run build`
