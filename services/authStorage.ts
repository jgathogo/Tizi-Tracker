const AUTH_KEY = 'tizi_tracker_auth';

export interface CloudUser {
  id: string;
  email: string;
}

export interface StoredAuth {
  token: string;
  userId: string;
  email: string;
}

export function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed?.token || !parsed?.userId || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredAuth(auth: StoredAuth | null): void {
  if (!auth) {
    localStorage.removeItem(AUTH_KEY);
    return;
  }
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}
