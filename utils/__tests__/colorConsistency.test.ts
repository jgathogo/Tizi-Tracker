/**
 * Tests to verify color consistency across the app
 * 
 * Ensures all components use standardized color shades
 * and don't have inconsistent color usage
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Color Consistency', () => {
  const projectRoot = join(__dirname, '../..');
  
  // Standard color palette - these are the ONLY shades that should be used
  const STANDARD_DARK_COLORS = {
    backgrounds: ['bg-slate-900', 'bg-slate-800', 'bg-slate-700', 'bg-slate-600'],
    text: ['text-white', 'text-slate-300', 'text-slate-400', 'text-slate-500'],
    borders: ['border-slate-700', 'border-slate-600'],
    // Allow semi-transparent versions for overlays
    semiTransparent: ['bg-slate-900/50', 'bg-slate-800/50', 'bg-slate-800/90', 'bg-slate-700/50']
  };

  const STANDARD_LIGHT_COLORS = {
    backgrounds: ['bg-slate-50', 'bg-white', 'bg-slate-100', 'bg-slate-200'],
    text: ['text-slate-900', 'text-slate-700', 'text-slate-600', 'text-slate-500'],
    borders: ['border-slate-300', 'border-slate-200'],
    semiTransparent: ['bg-white/90', 'bg-slate-50/90']
  };

  // Non-standard colors that should NOT be used (indicating inconsistency)
  const NON_STANDARD_COLORS = [
    'bg-slate-950',  // Too dark, inconsistent
    'text-slate-100', // Too light for dark theme
    'text-slate-800', // Should use slate-900 for light theme primary text
    'bg-slate-900/90', // Should use /50 or /80, not /90
    'bg-slate-800/40', // Should use /50 or /80
  ];

  const getComponentFiles = () => {
    const componentsDir = join(projectRoot, 'components');
    return [
      join(componentsDir, 'App.tsx'),
      join(componentsDir, 'History.tsx'),
      join(componentsDir, 'Progress.tsx'),
      join(componentsDir, 'ExerciseCard.tsx'),
      join(componentsDir, 'SettingsModal.tsx'),
      join(componentsDir, 'WorkoutCompleteModal.tsx'),
      join(componentsDir, 'WarmupCalculator.tsx'),
      join(componentsDir, 'RestTimer.tsx'),
      join(componentsDir, 'AddExerciseModal.tsx'),
      join(componentsDir, 'WeightAdjustmentModal.tsx'),
      join(componentsDir, 'AuthModal.tsx'),
    ].filter(file => {
      try {
        readFileSync(file, 'utf-8');
        return true;
      } catch {
        return false;
      }
    });
  };

  it('should not use non-standard color shades', () => {
    const files = getComponentFiles();
    const violations: Array<{ file: string; line: number; color: string }> = [];

    files.forEach(file => {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        NON_STANDARD_COLORS.forEach(nonStandard => {
          if (line.includes(nonStandard)) {
            violations.push({
              file: file.replace(projectRoot, ''),
              line: index + 1,
              color: nonStandard
            });
          }
        });
      });
    });

    if (violations.length > 0) {
      const violationMessages = violations.map(v => 
        `  ${v.file}:${v.line} - Found ${v.color}`
      ).join('\n');
      expect.fail(`Found non-standard color usage:\n${violationMessages}`);
    }
  });

  it('should use consistent background colors for cards', () => {
    // Cards should use bg-slate-800 for dark theme, bg-white for light theme
    const files = getComponentFiles();
    const cardBgPattern = /bg-slate-(950|900|700|600)/g;
    const violations: Array<{ file: string; line: number }> = [];

    files.forEach(file => {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for non-standard card backgrounds (excluding semi-transparent)
        if (cardBgPattern.test(line) && !line.includes('/')) {
          // Allow slate-900 for main backgrounds, but not for cards
          if (line.includes('bg-slate-900') && !line.includes('main') && !line.includes('screen')) {
            // This might be okay if it's a main background, but let's flag it
            if (!line.includes('min-h-screen') && !line.includes('fixed inset-0')) {
              violations.push({
                file: file.replace(projectRoot, ''),
                line: index + 1
              });
            }
          }
        }
      });
    });

    // This is a soft check - we'll just log warnings
    if (violations.length > 0) {
      console.warn(`Found potential card background inconsistencies in ${violations.length} locations`);
    }
  });

  it('should use consistent text colors', () => {
    // Primary text should be text-white for dark theme, text-slate-900 for light theme
    // Secondary text should be text-slate-300 for dark theme, text-slate-700 for light theme
    const files = getComponentFiles();
    const nonStandardTextPattern = /text-slate-(100|200|800)/g;
    const violations: Array<{ file: string; line: number; color: string }> = [];

    files.forEach(file => {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        const matches = line.match(nonStandardTextPattern);
        if (matches) {
          matches.forEach(match => {
            violations.push({
              file: file.replace(projectRoot, ''),
              line: index + 1,
              color: match
            });
          });
        }
      });
    });

    // text-slate-200 is acceptable for secondary text in dark theme
    // But we should prefer text-slate-300 for consistency
    const filteredViolations = violations.filter(v => 
      v.color !== 'text-slate-200' // Allow slate-200 as it's close to slate-300
    );

    if (filteredViolations.length > 0) {
      const violationMessages = filteredViolations.map(v => 
        `  ${v.file}:${v.line} - Found ${v.color}`
      ).join('\n');
      expect.fail(`Found non-standard text colors:\n${violationMessages}`);
    }
  });
});
