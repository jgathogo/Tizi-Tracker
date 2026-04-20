/**
 * Authentication against the self-hosted Tizi API (email + password, JWT).
 */

import { getApiBaseUrl, isApiConfigured } from './apiConfig';
import { readStoredAuth, writeStoredAuth, type CloudUser, type StoredAuth } from './authStorage';

export function isAuthAvailable(): boolean {
  return isApiConfigured();
}

export function getCurrentUser(): CloudUser | null {
  const a = readStoredAuth();
  if (!a) return null;
  return { id: a.userId, email: a.email };
}

export async function signOut(): Promise<void> {
  writeStoredAuth(null);
}

function parseDetail(detail: unknown): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e: { msg?: string }) => e?.msg || JSON.stringify(e))
      .join('; ');
  }
  return 'Request failed';
}

async function postJson<T>(path: string, body: object): Promise<T> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(parseDetail(data.detail) || res.statusText);
  }
  return data as T;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
}

function persistFromTokenResponse(data: TokenResponse): StoredAuth {
  const auth: StoredAuth = {
    token: data.access_token,
    userId: data.user_id,
    email: data.email,
  };
  writeStoredAuth(auth);
  return auth;
}

export async function signUpWithEmail(email: string, password: string): Promise<CloudUser | null> {
  if (!isAuthAvailable()) {
    throw new Error('Cloud sync is not configured (set VITE_TIZI_API_URL)');
  }
  const data = await postJson<TokenResponse>('/auth/register', { email, password });
  persistFromTokenResponse(data);
  return { id: data.user_id, email: data.email };
}

export async function signInWithEmail(email: string, password: string): Promise<CloudUser | null> {
  if (!isAuthAvailable()) {
    throw new Error('Cloud sync is not configured (set VITE_TIZI_API_URL)');
  }
  const data = await postJson<TokenResponse>('/auth/login', { email, password });
  persistFromTokenResponse(data);
  return { id: data.user_id, email: data.email };
}

export type { CloudUser, StoredAuth } from './authStorage';
