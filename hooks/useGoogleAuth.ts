import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState, useRef } from 'react';
import { ResponseType } from 'expo-auth-session';
import { setSessionToken } from '../lib/session';

// Complete the auth session on redirect (required for expo-auth-session)
WebBrowser.maybeCompleteAuthSession();

export type AuthMode = 'signin' | 'signup';

export interface GoogleAuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

interface UseGoogleAuthReturn {
  signIn: (mode?: AuthMode) => Promise<void>;
  isLoading: boolean;
  loadingMode: AuthMode | null;
  error: string | null;
}

/**
 * useGoogleAuth — wraps expo-auth-session Google provider with PKCE.
 *
 * On success:
 *   1. Sends the Google id_token to our backend /api/auth/google.
 *   2. Receives a signed JWT sessionToken.
 *   3. Persists the token via expo-secure-store (lib/session.ts).
 *   4. Calls onSuccess(user) so the caller can update auth context / navigate.
 *
 * On failure: sets `error` string.
 */
export function useGoogleAuth(onSuccess: (user: GoogleAuthUser) => void): UseGoogleAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState<AuthMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeModeRef = useRef<AuthMode>('signin');

  const androidClientId =
    process.env.EXPO_PUBLIC_GOOGLE_OAUTH_ANDROID_CLIENT_ID ||
    process.env.GOOGLE_OAUTH_ANDROID_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID;

  const iosClientId =
    process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID ||
    process.env.GOOGLE_OAUTH_IOS_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID;

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID;

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId,
    iosClientId,
    webClientId,
    // ResponseType.IdToken requests the id_token directly (hybrid flow).
    // This avoids needing a client_secret to exchange an auth code — which
    // is not available in a public web client running on the frontend.
    responseType: ResponseType.IdToken,
    scopes: ['openid', 'profile', 'email'],
  });

  // TODO: Remove this log once Google OAuth is working
  // This prints the EXACT redirect URI you need to add in Google Cloud Console
  console.log('[GoogleAuth] redirectUri =', request?.redirectUri);

  useEffect(() => {
    if (response?.type !== 'success') {
      if (response?.type === 'error') {
        setError(response.error?.message ?? 'Google sign-in failed');
        setIsLoading(false);
        setLoadingMode(null);
      } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
        setIsLoading(false);
        setLoadingMode(null);
      }
      return;
    }

    // id_token can come from either:
    //   - response.authentication.idToken  (PKCE code exchange — native builds)
    //   - response.params.id_token         (implicit/hybrid flow — web)
    const idToken =
      (response as any).authentication?.idToken ??
      (response as any).params?.id_token;

    if (!idToken) {
      setError('No id_token received from Google');
      setIsLoading(false);
      setLoadingMode(null);
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken,
            mode: activeModeRef.current,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? 'Authentication failed');
          return;
        }

        await setSessionToken(data.sessionToken);
        onSuccess(data.user);
      } catch (err: any) {
        setError(err.message ?? 'Network error during sign-in');
      } finally {
        setIsLoading(false);
        setLoadingMode(null);
      }
    })();
  }, [response]);

  const signIn = async (mode: AuthMode = 'signin') => {
    activeModeRef.current = mode;
    setError(null);
    setIsLoading(true);
    setLoadingMode(mode);
    try {
      await promptAsync();
    } catch (err: any) {
      setError(err.message ?? 'Failed to open Google sign-in');
      setIsLoading(false);
      setLoadingMode(null);
    }
  };

  return { signIn, isLoading, loadingMode, error };
}
