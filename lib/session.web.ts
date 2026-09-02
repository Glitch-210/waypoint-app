// Web platform stub for lib/session.ts — Metro resolves .web.ts first on web.
// Uses localStorage instead of expo-secure-store (which is native-only).

const SESSION_TOKEN_KEY = 'waypoint_session_token';

export async function getSessionToken(): Promise<string | null> {
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setSessionToken(token: string): Promise<void> {
  try {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export async function clearSessionToken(): Promise<void> {
  try {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // ignore
  }
}

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
