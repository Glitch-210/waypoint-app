import React, { useEffect, useRef } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useShareIntent } from 'expo-share-intent';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useListStore } from '../store/useListStore';
import { cachePlaces } from '../lib/db/offlineCache';
import { authFetch } from '../lib/session';
import { AuthProvider, useAuth } from '../context/AuthContext';

function ShareIntentHandler() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoaded && isSignedIn && hasShareIntent && shareIntent.text) {
      if (segments[0] !== '(share)') {
        router.push({
          pathname: '/(share)/choose-list',
          params: { sharedUrl: shareIntent.text },
        });
        resetShareIntent();
      }
    }
  }, [hasShareIntent, shareIntent, isLoaded, isSignedIn, segments]);

  return null;
}

function SyncOnReconnect() {
  const { isConnected } = useNetworkStatus();
  const { user } = useAuth();
  const { lists } = useListStore();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!isConnected) {
      wasOffline.current = true;
      return;
    }

    if (!wasOffline.current || !user?.id) return;

    // Reconnected — re-sync all cached lists via API route
    wasOffline.current = false;
    const cachedLists = lists.filter((l) => l.isOfflineCached);
    cachedLists.forEach(async (list) => {
      try {
        const res = await authFetch(`/api/lists?listId=${encodeURIComponent(list.id)}`);
        if (res.ok) {
          const data = await res.json();
          await cachePlaces(data.places || []);
        }
      } catch (err) {
        console.warn('[sync] Failed to re-sync list', list.id, err);
      }
    });
  }, [isConnected, user?.id]);

  return null;
}

function AuthRouteHandler() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (isSignedIn && inAuthGroup) {
      router.replace('/(tabs)/lists');
    }
  }, [isLoaded, isSignedIn, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthRouteHandler />
      <SyncOnReconnect />
      <ShareIntentHandler />
      <Slot />
    </AuthProvider>
  );
}
