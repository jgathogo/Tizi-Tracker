/**
 * Tests for theme color utility
 * 
 * Ensures DaisyUI semantic classes are properly configured
 */

import { describe, it, expect } from 'vitest';
import { themeColors, getBgClass, getBorderClass, getTextClass, type Theme } from '../themeColors';

describe('themeColors', () => {
  describe('themeColors object', () => {
    it('should have all required DaisyUI semantic color classes', () => {
      expect(themeColors.mainBg).toBeDefined();
      expect(themeColors.cardBg).toBeDefined();
      expect(themeColors.cardHeaderBg).toBeDefined();
      expect(themeColors.inputBg).toBeDefined();
      expect(themeColors.hoverBg).toBeDefined();
      expect(themeColors.hoverBgLight).toBeDefined();
      expect(themeColors.border).toBeDefined();
      expect(themeColors.borderLight).toBeDefined();
      expect(themeColors.textPrimary).toBeDefined();
      expect(themeColors.textSecondary).toBeDefined();
      expect(themeColors.textTertiary).toBeDefined();
      expect(themeColors.textMuted).toBeDefined();
      expect(themeColors.overlay).toBeDefined();
    });

    it('should use DaisyUI semantic classes', () => {
      // Main background should use base-100
      expect(themeColors.mainBg).toBe('bg-base-100');
      // Card background should use base-200
      expect(themeColors.cardBg).toBe('bg-base-200');
      // Borders should use base-300
      expect(themeColors.border).toContain('base-300');
      // Text should use base-content
      expect(themeColors.textPrimary).toContain('base-content');
    });
  });

  describe('getBgClass', () => {
    it('should return main background (DaisyUI semantic)', () => {
      const bg = getBgClass('dark', 'main');
      expect(bg).toBe('bg-base-100');
    });

    it('should return card background (DaisyUI semantic)', () => {
      const bg = getBgClass('dark', 'card');
      expect(bg).toBe('bg-base-200');
    });

    it('should return same classes for all themes (DaisyUI adapts)', () => {
      const darkBg = getBgClass('dark', 'card');
      const lightBg = getBgClass('light', 'card');
      const gardenBg = getBgClass('garden', 'card');
      
      // All themes use the same semantic classes - DaisyUI handles the actual colors
      expect(darkBg).toBe(lightBg);
      expect(lightBg).toBe(gardenBg);
    });

    it('should default to card background', () => {
      const bg = getBgClass('dark');
      expect(bg).toBe('bg-base-200');
    });
  });

  describe('getBorderClass', () => {
    it('should return standard border (DaisyUI semantic)', () => {
      const border = getBorderClass('dark', 'standard');
      expect(border).toContain('base-300');
    });

    it('should return same classes for all themes', () => {
      const darkBorder = getBorderClass('dark', 'standard');
      const lightBorder = getBorderClass('light', 'standard');
      
      expect(darkBorder).toBe(lightBorder);
    });

    it('should default to standard border', () => {
      const border = getBorderClass('dark');
      expect(border).toContain('base-300');
    });
  });

  describe('getTextClass', () => {
    it('should return primary text (DaisyUI semantic)', () => {
      const text = getTextClass('dark', 'primary');
      expect(text).toContain('base-content');
    });

    it('should return secondary text with opacity', () => {
      const text = getTextClass('dark', 'secondary');
      expect(text).toContain('base-content');
      expect(text).toContain('/70');
    });

    it('should return same classes for all themes', () => {
      const darkText = getTextClass('dark', 'primary');
      const lightText = getTextClass('light', 'primary');
      
      expect(darkText).toBe(lightText);
    });

    it('should default to primary text', () => {
      const text = getTextClass('dark');
      expect(text).toContain('base-content');
    });
  });
});
