/**
 * Backup utility functions for Tizi Tracker
 * 
 * Provides functions to export user data to a downloadable file.
 * This ensures users can manually save their workout data to their device.
 */

import { UserProfile } from '../types';

/**
 * Exports user data to a downloadable JSON file.
 * 
 * Args:
 *   user: The user profile data to export.
 * 
 * Returns:
 *   boolean: True if export was successful, false otherwise.
 */
export const exportUserData = (user: UserProfile): boolean => {
  try {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const date = new Date().toISOString().split('T')[0];
    downloadAnchorNode.setAttribute("download", `tizi_tracker_backup_${date}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    document.body.removeChild(downloadAnchorNode);
    
    // Save backup timestamp to localStorage
    localStorage.setItem('tizi_tracker_last_backup', new Date().toISOString());
    
    return true;
  } catch (error) {
    console.error('❌ Failed to export data:', error);
    return false;
  }
};

/**
 * Gets the timestamp of the last backup.
 * 
 * Returns:
 *   Date | null: The last backup date, or null if no backup exists.
 */
export const getLastBackupDate = (): Date | null => {
  const lastBackup = localStorage.getItem('tizi_tracker_last_backup');
  if (!lastBackup) return null;
  return new Date(lastBackup);
};

/**
 * Gets the number of days since the last backup.
 * 
 * Returns:
 *   number | null: Days since last backup, or null if no backup exists.
 */
export const getDaysSinceLastBackup = (): number | null => {
  const lastBackup = getLastBackupDate();
  if (!lastBackup) return null;
  const today = new Date();
  const diffTime = today.getTime() - lastBackup.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Checks if a backup reminder should be shown (if backup is older than 7 days).
 * 
 * Returns:
 *   boolean: True if backup reminder should be shown.
 */
export const shouldShowBackupReminder = (): boolean => {
  const daysSince = getDaysSinceLastBackup();
  if (daysSince === null) return true; // No backup ever
  return daysSince > 7; // More than 7 days old
};


