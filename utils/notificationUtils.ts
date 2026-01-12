/**
 * Notification and haptic feedback utilities
 * Provides system notifications and device vibration for better user experience
 */

/**
 * Requests permission for browser notifications
 * Returns true if permission is granted or already granted, false otherwise
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Notification permission was denied');
    return false;
  }

  // Permission is 'default' - request it
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

/**
 * Shows a system notification
 * Only works if permission has been granted and the page is not in focus
 * 
 * @param title - Notification title
 * @param options - Optional notification options (body, icon, etc.)
 */
export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return;
  }

  if (Notification.permission !== 'granted') {
    // Permission not granted - silently fail (user can enable later)
    return;
  }

  // Only show notification if page is not in focus (background notification)
  if (document.hidden) {
    try {
      const notification = new Notification(title, {
        body: options?.body || 'Rest time is up!',
        icon: options?.icon || '/favicon.svg',
        badge: options?.badge || '/favicon.svg',
        tag: 'rest-timer', // Tag prevents multiple notifications
        requireInteraction: false,
        ...options,
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    } catch (error) {
      console.warn('Failed to show notification:', error);
    }
  }
};

/**
 * Triggers haptic feedback (vibration) on supported devices
 * Uses a distinct pattern (buzz-buzz-buzz) to differentiate from standard notifications
 * 
 * @param pattern - Vibration pattern in milliseconds (default: [200, 100, 200, 100, 200])
 */
export const triggerHapticFeedback = (pattern?: number[]): void => {
  if (!('vibrate' in navigator)) {
    // Silently fail if vibration is not supported
    return;
  }

  try {
    // Default pattern: buzz-buzz-buzz (200ms on, 100ms off, repeat)
    const vibrationPattern = pattern || [200, 100, 200, 100, 200];
    navigator.vibrate(vibrationPattern);
  } catch (error) {
    console.warn('Failed to trigger haptic feedback:', error);
  }
};

/**
 * Checks if haptic feedback (vibration) is available
 */
export const isHapticAvailable = (): boolean => {
  return 'vibrate' in navigator;
};

/**
 * Checks if notifications are available
 */
export const isNotificationAvailable = (): boolean => {
  return 'Notification' in window;
};
