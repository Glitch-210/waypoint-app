import * as SecureStore from 'expo-secure-store';

const SESSION_TOKEN_KEY = 'waypoint_session_token';

/**
 * Reads the JWT session token from SecureStore.
 * Returns null if not found or on error.
 */
export async function getSessionToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Persists the JWT session token to SecureStore.
 */
export async function setSessionToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
  } catch (err) {
    console.warn('[session] Failed to save token:', err);
  }
}

/**
 * Deletes the JWT session token from SecureStore (sign-out).
 */
export async function clearSessionToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
  } catch (err) {
    console.warn('[session] Failed to clear token:', err);
  }
}

/**
 * fetch() wrapper that automatically injects the Authorization: Bearer header.
 * Use this everywhere instead of raw fetch() for authenticated API calls.
 *
 * Usage:
 *   const res = await authFetch('/api/lists');
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getSessionToken();

  const headers = new Headers(options.headers ?? {});
  headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, { ...options, headers });
}
