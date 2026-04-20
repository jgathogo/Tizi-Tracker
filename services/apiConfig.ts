/**
 * Self-hosted Tizi sync API (VPS). Set VITE_TIZI_API_URL at build time, e.g.
 * https://tizi.gathogo.co.ke/api/v1
 */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_TIZI_API_URL as string | undefined;
  return (raw || '').trim().replace(/\/$/, '');
}

export function isApiConfigured(): boolean {
  return getApiBaseUrl().length > 0;
}
