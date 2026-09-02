import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useRouter } from 'expo-router';
import { getSessionToken, clearSessionToken } from '../lib/session';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

interface AuthContextValue {
  /** Hydrated user from the stored session. Null when signed out. */
  user: AuthUser | null;
  /** True once the initial SecureStore read has completed. */
  isLoaded: boolean;
  /** Convenience alias — true when user !== null. */
  isSignedIn: boolean;
  /** Call after a successful sign-in to hydrate the context. */
  setUser: (user: AuthUser) => void;
  /**
   * Signs the user out:
   *  1. Clears the JWT from SecureStore.
   *  2. Nulls out the in-memory user.
   *  3. Redirects to /(auth)/sign-in.
   */
  signOut: () => Promise<void>;
}

// --------------------------------------------------------------------------
// Context
// --------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

// --------------------------------------------------------------------------
// Minimal JWT payload decoder (no verification — server does that).
// We only need to read the userId for display; actual auth happens on
// every API call via the Authorization header verified by requireAuth().
// --------------------------------------------------------------------------

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    // atob works on both React Native's Hermes (global) and web
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() / 1000 > payload.exp;
}

// --------------------------------------------------------------------------
// Provider
// --------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  // On mount: read stored token and, if valid, fetch current user profile
  // from the backend so we always have fresh data (name/avatar may have changed).
  useEffect(() => {
    (async () => {
      try {
        const token = await getSessionToken();

        if (!token || isTokenExpired(token)) {
          // No token or expired — stay logged out
          setIsLoaded(true);
          return;
        }

        // Fetch fresh user from backend (lightweight — returns cached Neon row)
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUserState(data.user);
        } else {
          // Token rejected by server — clear it
          await clearSessionToken();
        }
      } catch {
        // Network error — leave user as null; they'll see sign-in screen
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const setUser = useCallback((newUser: AuthUser) => {
    setUserState(newUser);
  }, []);

  const signOut = useCallback(async () => {
    await clearSessionToken();
    setUserState(null);
    router.replace('/(auth)/sign-in');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoaded,
        isSignedIn: user !== null,
        setUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// --------------------------------------------------------------------------
// Hook
// --------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
