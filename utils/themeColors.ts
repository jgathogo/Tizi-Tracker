/**
 * DaisyUI Theme System
 * 
 * This utility provides access to DaisyUI's 30+ built-in themes.
 * DaisyUI uses semantic color classes that automatically adapt to the selected theme.
 * 
 * Available themes:
 * light, dark, cupcake, bumblebee, emerald, corporate, synthwave, retro,
 * cyberpunk, valentine, halloween, garden, forest, aqua, lofi, pastel,
 * fantasy, wireframe, black, luxury, dracula, cmyk, autumn, business,
 * acid, lemonade, night, coffee, winter
 */

export type Theme = 
  | 'light' | 'dark' | 'cupcake' | 'bumblebee' | 'emerald'
  | 'corporate' | 'synthwave' | 'retro' | 'cyberpunk' | 'valentine'
  | 'halloween' | 'garden' | 'forest' | 'aqua' | 'lofi' | 'pastel'
  | 'fantasy' | 'wireframe' | 'black' | 'luxury' | 'dracula' | 'cmyk'
  | 'autumn' | 'business' | 'acid' | 'lemonade' | 'night' | 'coffee' | 'winter';

export const availableThemes: Theme[] = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald',
  'corporate', 'synthwave', 'retro', 'cyberpunk', 'valentine',
  'halloween', 'garden', 'forest', 'aqua', 'lofi', 'pastel',
  'fantasy', 'wireframe', 'black', 'luxury', 'dracula', 'cmyk',
  'autumn', 'business', 'acid', 'lemonade', 'night', 'coffee', 'winter'
];

/**
 * Apply theme to the document
 * DaisyUI uses data-theme attribute on html element
 */
export const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('tizi_theme', theme);
};

/**
 * Get current theme from localStorage or default to 'dark'
 */
export const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem('tizi_theme');
  return (stored as Theme) || 'dark';
};

/**
 * Initialize theme on app load
 */
export const initializeTheme = () => {
  const theme = getStoredTheme();
  applyTheme(theme);
};

/**
 * DaisyUI Semantic Color Classes
 * 
 * DaisyUI provides semantic color classes that automatically adapt to the selected theme.
 * These classes work with all 30+ themes without needing theme-specific definitions.
 * 
 * Key DaisyUI classes:
 * - bg-base-100: Main background
 * - bg-base-200: Card/component background
 * - bg-base-300: Hover/active states
 * - text-base-content: Primary text (automatically contrasts with bg-base-100)
 * - text-base-content/70: Secondary text (70% opacity)
 * - border-base-300: Borders
 * - bg-primary, text-primary: Theme's primary color
 * - bg-secondary, text-secondary: Theme's secondary color
 * - bg-accent, text-accent: Theme's accent color
 */

/**
 * Legacy theme colors for backward compatibility
 * These map to DaisyUI semantic classes
 */
export const themeColors = {
  // DaisyUI semantic classes work for all themes
  mainBg: 'bg-base-100',
  cardBg: 'bg-base-200',
  cardHeaderBg: 'bg-base-200',
  inputBg: 'bg-base-200',
  hoverBg: 'bg-base-300',
  hoverBgLight: 'bg-base-200',
  
  border: 'border-base-300',
  borderLight: 'border-base-300',
  
  textPrimary: 'text-base-content',
  textSecondary: 'text-base-content/70',
  textTertiary: 'text-base-content/60',
  textMuted: 'text-base-content/50',
  
  overlay: 'bg-black/80',
};

/**
 * Helper to get background class (DaisyUI semantic)
 * Works with all themes automatically
 */
export const getBgClass = (_theme: Theme, type: 'main' | 'card' | 'cardHeader' | 'input' | 'hover' | 'hoverLight' = 'card') => {
  switch (type) {
    case 'main': return themeColors.mainBg;
    case 'card': return themeColors.cardBg;
    case 'cardHeader': return themeColors.cardHeaderBg;
    case 'input': return themeColors.inputBg;
    case 'hover': return themeColors.hoverBg;
    case 'hoverLight': return themeColors.hoverBgLight;
    default: return themeColors.cardBg;
  }
};

/**
 * Helper to get border class (DaisyUI semantic)
 */
export const getBorderClass = (_theme: Theme, type: 'standard' | 'light' = 'standard') => {
  return type === 'light' ? themeColors.borderLight : themeColors.border;
};

/**
 * Helper to get text class (DaisyUI semantic)
 */
export const getTextClass = (_theme: Theme, type: 'primary' | 'secondary' | 'tertiary' | 'muted' = 'primary') => {
  switch (type) {
    case 'primary': return themeColors.textPrimary;
    case 'secondary': return themeColors.textSecondary;
    case 'tertiary': return themeColors.textTertiary;
    case 'muted': return themeColors.textMuted;
    default: return themeColors.textPrimary;
  }
};

/**
 * Convenience aliases for common colors (for backward compatibility)
 */
export const getPrimaryTextColor = (_theme: Theme) => themeColors.textPrimary;
export const getSecondaryTextColor = (_theme: Theme) => themeColors.textSecondary;
export const getBackgroundColor = (_theme: Theme) => themeColors.mainBg;
export const getCardColor = (_theme: Theme) => themeColors.cardBg;
export const getBorderColor = (_theme: Theme) => themeColors.border;
