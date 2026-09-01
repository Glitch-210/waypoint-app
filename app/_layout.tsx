import React, { useEffect, useRef } from 'react';
import { ClerkProvider, ClerkLoaded, useUser } from '@clerk/expo';
import { tokenCache } from '../lib/auth/clerk';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useShareIntent } from 'expo-share-intent';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useListStore } from '../store/useListStore';
import { cachePlaces } from '../lib/db/offlineCache';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
  );
}

function ShareIntentHandler() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const segments = useSegments();

  useEffect(() => {
    // Only handle intent if the user is signed in and we have a valid share intent
    if (isLoaded && isSignedIn && hasShareIntent && shareIntent.text) {
      // Don't route if we are already in the share flow to avoid loops
      if (segments[0] !== '(share)') {
        router.push({
          pathname: '/(share)/choose-list',
          params: { sharedUrl: shareIntent.text }
        });
        resetShareIntent();
      }
    }
  }, [hasShareIntent, shareIntent, isLoaded, isSignedIn, segments]);

  return null;
}

function SyncOnReconnect() {
  const { isConnected } = useNetworkStatus();
  const { user } = useUser();
  const { lists } = useListStore();
  const wasOffline = useRef(false);

  useEffect(() => {
    // Track offline → online transitions
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
        const res = await fetch(`/api/places?listId=${encodeURIComponent(list.id)}&userId=${encodeURIComponent(user.id)}`);
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
  const { isLoaded, isSignedIn } = useUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isSignedIn && !inAuthGroup) {
      // Redirect to sign-in if user is not signed in and not in (auth)
      router.replace('/(auth)/sign-in');
    } else if (isSignedIn && inAuthGroup) {
      // Redirect to main tabs if signed in and in (auth)
      router.replace('/(tabs)/lists');
    }
  }, [isLoaded, isSignedIn, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <AuthRouteHandler />
        <SyncOnReconnect />
        <ShareIntentHandler />
        <Slot />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
