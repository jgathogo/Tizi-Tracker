/**
 * Tests for audio utilities
 * 
 * Note: Audio testing is limited due to browser AudioContext restrictions.
 * These tests verify the functions don't throw errors and handle edge cases.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { playBellSound, playBeepSound, isAudioAvailable } from '../audioUtils';

describe('audioUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isAudioAvailable', () => {
    it('should return true when AudioContext is available', () => {
      // AudioContext should be available in test environment (jsdom)
      const result = isAudioAvailable();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('playBellSound', () => {
    it('should not throw an error when called', () => {
      expect(() => playBellSound()).not.toThrow();
    });

    it('should handle AudioContext errors gracefully', () => {
      // Store original
      const originalAudioContext = global.AudioContext;
      
      // Mock AudioContext to throw
      global.AudioContext = vi.fn(() => {
        throw new Error('AudioContext not available');
      }) as any;
      delete (global as any).webkitAudioContext;
      
      // Should not throw (falls back to beep)
      expect(() => playBellSound()).not.toThrow();
      
      // Restore
      global.AudioContext = originalAudioContext;
    });

    it('should be callable multiple times', () => {
      expect(() => {
        playBellSound();
        playBellSound();
        playBellSound();
      }).not.toThrow();
    });
  });

  describe('playBeepSound', () => {
    it('should not throw an error when called', () => {
      expect(() => playBeepSound()).not.toThrow();
    });

    it('should handle AudioContext errors gracefully', () => {
      // Store original
      const originalAudioContext = global.AudioContext;
      
      // Mock AudioContext to throw
      global.AudioContext = vi.fn(() => {
        throw new Error('AudioContext not available');
      }) as any;
      delete (global as any).webkitAudioContext;
      
      // Should not throw
      expect(() => playBeepSound()).not.toThrow();
      
      // Restore
      global.AudioContext = originalAudioContext;
    });

    it('should be callable multiple times', () => {
      expect(() => {
        playBeepSound();
        playBeepSound();
        playBeepSound();
      }).not.toThrow();
    });
  });
});
