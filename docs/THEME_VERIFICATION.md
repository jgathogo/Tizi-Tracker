# DaisyUI Dark Theme - Expected Colors

## What You Should See When Dark Theme is Selected

When the **Dark** theme is selected, here's what each color should look like:

### Background Colors
- **Main Background (`bg-base-100`)**: Dark gray-blue (`oklch(25.33% 0.016 252.42)`) - This is the main page background
- **Card Background (`bg-base-200`)**: Slightly darker gray-blue (`oklch(23.26% 0.014 253.1)`) - Used for cards, modals, components
- **Hover/Active Background (`bg-base-300`)**: Even darker (`oklch(21.15% 0.012 254.09)`) - Used for hover states

### Text Colors
- **Primary Text (`text-base-content`)**: Very light, almost white (`oklch(97.807% 0.029 256.847)`) - Main text color
- **Secondary Text (`text-base-content/70`)**: Same as primary but 70% opacity - For less important text
- **Muted Text (`text-base-content/60`)**: Same as primary but 60% opacity - For labels, hints

### Semantic Colors
- **Primary (`bg-primary`, `text-primary`)**: Purple-blue (`oklch(58% 0.233 277.117)`) - Buttons, links, highlights
- **Primary Content (`text-primary-content`)**: Very light (`oklch(96% 0.018 272.314)`) - Text on primary buttons
- **Secondary (`bg-secondary`, `text-secondary`)**: Pink-purple (`oklch(65% 0.241 354.308)`)
- **Success (`bg-success`, `text-success`)**: Green (`oklch(76% 0.177 163.223)`)
- **Warning (`bg-warning`, `text-warning`)**: Yellow (`oklch(82% 0.189 84.429)`)
- **Error (`bg-error`, `text-error`)**: Red (`oklch(71% 0.194 13.428)`)
- **Info (`bg-info`, `text-info`)**: Blue (`oklch(74% 0.16 232.661)`)

### Borders
- **Standard Border (`border-base-300`)**: Uses the same color as `bg-base-300`

## How to Verify Dark Theme is Working

1. **Check HTML Element**: Open browser DevTools (F12), inspect the `<html>` element
   - Should have: `data-theme="dark"` attribute
   - If missing or wrong, theme is not being applied

2. **Check CSS Variables**: In DevTools, look at computed styles for `<html>`
   - Should see: `--color-base-100: oklch(25.33% 0.016 252.42)`
   - If you see light colors instead, theme is not applied

3. **Visual Check**:
   - Page background should be dark gray-blue (not white or light gray)
   - Text should be very light/white (not dark)
   - Cards/modals should be slightly darker than background
   - Primary buttons should be purple-blue
   - Success elements should be green
   - Warning elements should be yellow

4. **Compare with Light Theme**:
   - Light theme: White/light gray backgrounds, dark text
   - Dark theme: Dark gray-blue backgrounds, light text
   - If both look the same, theme switching is broken

## Common Issues

1. **All themes look the same**: 
   - Check if `data-theme` attribute is being set on `<html>`
   - Check if CSS variables are being applied
   - Check for hardcoded colors overriding theme

2. **Only dark theme works**:
   - Likely hardcoded colors that were designed for dark mode
   - Need to replace with DaisyUI semantic classes

3. **Theme selector doesn't change anything**:
   - Verify `applyTheme()` function is being called
   - Check browser console for errors
   - Verify `localStorage` has `tizi_theme` key
