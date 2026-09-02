import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ResponseType } from 'expo-auth-session';
import { setSessionToken } from '../lib/session';

// Complete the auth session on redirect (required for expo-auth-session)
WebBrowser.maybeCompleteAuthSession();

export interface GoogleAuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

interface UseGoogleAuthReturn {
  signIn: () => Promise<void>;
  isLoading: boolean;
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
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID,
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
      } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
        setIsLoading(false);
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
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
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
      }
    })();
  }, [response]);

  const signIn = async () => {
    setError(null);
    setIsLoading(true);
    await promptAsync();
    // isLoading remains true until the useEffect above resolves the response
  };

  return { signIn, isLoading, error };
}
