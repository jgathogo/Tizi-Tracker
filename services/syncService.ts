/**
 * Sync user profile with the self-hosted Tizi API (PostgreSQL on your VPS).
 */

import { getApiBaseUrl, isApiConfigured } from './apiConfig';
import { readStoredAuth, writeStoredAuth } from './authStorage';
import { getCurrentUser } from './authService';
import type { UserProfile } from '../types';

export const isSyncAvailable = (): boolean => {
  return isApiConfigured() && getCurrentUser() !== null;
};

function authHeaders(): HeadersInit {
  const a = readStoredAuth();
  if (!a?.token) return {};
  return { Authorization: `Bearer ${a.token}` };
}

function clearAuthIfUnauthorized(status: number): void {
  if (status === 401) {
    writeStoredAuth(null);
  }
}

/**
 * Save user profile to the server
 */
export const saveToCloud = async (profile: UserProfile): Promise<void> => {
  if (!isSyncAvailable()) {
    throw new Error('Cloud sync is not available');
  }

  const base = getApiBaseUrl();
  const body = { ...profile };

  const res = await fetch(`${base}/me/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });

  clearAuthIfUnauthorized(res.status);

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg =
      typeof errBody.detail === 'string'
        ? errBody.detail
        : res.statusText;
    throw new Error(msg || 'Failed to save profile');
  }
};

/**
 * Load user profile from the server
 */
export const loadFromCloud = async (): Promise<UserProfile | null> => {
  if (!isSyncAvailable()) {
    throw new Error('Cloud sync is not available');
  }

  const base = getApiBaseUrl();
  const res = await fetch(`${base}/me/profile`, {
    method: 'GET',
    headers: authHeaders(),
  });

  clearAuthIfUnauthorized(res.status);

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg =
      typeof errBody.detail === 'string'
        ? errBody.detail
        : res.statusText;
    throw new Error(msg || 'Failed to load profile');
  }

  const data = (await res.json()) as { profile?: Record<string, unknown> };
  const profile = data.profile;
  if (!profile || typeof profile !== 'object' || Object.keys(profile).length === 0) {
    return null;
  }
  const { lastSynced: _ls, ...rest } = profile as UserProfile & { lastSynced?: unknown };
  return rest as UserProfile;
};

/**
 * Merge local and cloud data (same strategy as before).
 */
export const mergeData = (localData: UserProfile, cloudData: UserProfile): UserProfile => {
  const localHistory = localData.history || [];
  const cloudHistory = cloudData.history || [];
  const historyMap = new Map<string, (typeof localHistory)[0]>();

  cloudHistory.forEach((workout) => {
    historyMap.set(workout.id, workout);
  });

  localHistory.forEach((workout) => {
    if (!historyMap.has(workout.id)) {
      historyMap.set(workout.id, workout);
    }
  });

  const mergedHistory = Array.from(historyMap.values()).sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return {
    ...localData,
    ...cloudData,
    history: mergedHistory,
  };
};

export const isOnline = (): boolean => {
  return navigator.onLine;
};
