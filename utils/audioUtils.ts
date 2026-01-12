/**
 * Audio utilities for playing sounds in the app
 * Uses Web Audio API to generate sounds programmatically (no external files needed)
 */

/**
 * Plays a bell/ding sound using Web Audio API
 * This creates a pleasant notification sound without requiring external audio files
 */
export const playBellSound = (): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Bell-like sound: two-tone chime
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    // Fallback: try using beep if AudioContext fails
    console.warn('AudioContext not available, using fallback beep');
    playBeepSound();
  }
};

/**
 * Plays a subtle beep/tick sound for interval alerts
 * Quieter and shorter than the bell sound
 */
export const playBeepSound = (): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Short, subtle beep
    oscillator.frequency.value = 600;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    // Silently fail if audio is not available
    console.warn('Audio not available:', error);
  }
};

/**
 * Checks if audio is available in the current environment
 */
export const isAudioAvailable = (): boolean => {
  return !!(window.AudioContext || (window as any).webkitAudioContext);
};
