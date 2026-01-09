/**
 * Cloud Sync Service
 * 
 * Handles syncing user data between localStorage and Firestore.
 * Implements offline-first strategy: save locally first, sync to cloud when online.
 */

import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import { getCurrentUser } from './authService';
import { UserProfile } from '../types';

/**
 * Check if cloud sync is available
 */
export const isSyncAvailable = (): boolean => {
  return isFirebaseConfigured() && db !== null && getCurrentUser() !== null;
};

/**
 * Get the Firestore document path for a user
 */
const getUserDocPath = (userId: string): string => {
  return `users/${userId}`;
};

/**
 * Save user profile to Firestore
 * 
 * Args:
 *   profile: User profile data to save
 * 
 * Returns:
 *   Promise that resolves when save is complete
 */
export const saveToCloud = async (profile: UserProfile): Promise<void> => {
  if (!isSyncAvailable() || !db) {
    throw new Error('Cloud sync is not available');
  }

  const user = getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const userDocRef = doc(db, getUserDocPath(user.uid));
    
    // Add lastSynced timestamp
    const profileWithTimestamp = {
      ...profile,
      lastSynced: Timestamp.now()
    };

    await setDoc(userDocRef, profileWithTimestamp, { merge: true });
    console.log('✅ Profile saved to cloud:', user.uid);
  } catch (error: any) {
    console.error('❌ Failed to save to cloud:', error);
    throw error;
  }
};

/**
 * Load user profile from Firestore
 * 
 * Returns:
 *   Promise that resolves with user profile, or null if not found
 */
export const loadFromCloud = async (): Promise<UserProfile | null> => {
  if (!isSyncAvailable() || !db) {
    throw new Error('Cloud sync is not available');
  }

  const user = getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const userDocRef = doc(db, getUserDocPath(user.uid));
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Remove lastSynced from profile (it's metadata, not part of UserProfile)
      const { lastSynced, ...profile } = data;
      console.log('✅ Profile loaded from cloud:', user.uid);
      return profile as UserProfile;
    } else {
      console.log('ℹ️ No cloud data found for user:', user.uid);
      return null;
    }
  } catch (error: any) {
    console.error('❌ Failed to load from cloud:', error);
    throw error;
  }
};

/**
 * Merge local and cloud data
 * 
 * Strategy: Use the most recent data (by lastSynced timestamp or last modified)
 * 
 * Args:
 *   localData: Data from localStorage
 *   cloudData: Data from Firestore
 * 
 * Returns:
 *   Merged UserProfile
 */
export const mergeData = (localData: UserProfile, cloudData: UserProfile): UserProfile => {
  // Simple merge strategy: prefer cloud data if it exists, otherwise use local
  // In a production app, you might want more sophisticated conflict resolution
  // For now, we'll prefer cloud data as it's likely more up-to-date across devices
  
  // Merge history: combine both, remove duplicates by ID, sort by date
  const localHistory = localData.history || [];
  const cloudHistory = cloudData.history || [];
  const historyMap = new Map();
  
  // Add cloud history first (prefer cloud)
  cloudHistory.forEach(workout => {
    historyMap.set(workout.id, workout);
  });
  
  // Add local history (only if not already in cloud)
  localHistory.forEach(workout => {
    if (!historyMap.has(workout.id)) {
      historyMap.set(workout.id, workout);
    }
  });
  
  // Convert back to array and sort by date
  const mergedHistory = Array.from(historyMap.values()).sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Merge other fields: prefer cloud, fallback to local
  return {
    ...localData, // Start with local (has all fields)
    ...cloudData, // Override with cloud data
    history: mergedHistory, // Use merged history
  };
};

/**
 * Check if device is online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};


