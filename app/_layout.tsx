import React, { useEffect, useRef } from 'react';
import { ClerkProvider, ClerkLoaded, useUser } from '@clerk/expo';
import { tokenCache } from '../lib/auth/clerk';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useShareIntent } from 'expo-share-intent';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useListStore } from '../store/useListStore';
import { getPlacesForList } from '../lib/services/placeService';
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

  return <Slot />;
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

    // Reconnected — re-sync all cached lists
    wasOffline.current = false;
    const cachedLists = lists.filter((l) => l.isOfflineCached);
    cachedLists.forEach(async (list) => {
      try {
        const fresh = await getPlacesForList(list.id, user.id);
        await cachePlaces(fresh as any);
      } catch (err) {
        console.warn('[sync] Failed to re-sync list', list.id, err);
      }
    });
  }, [isConnected, user?.id]);

  return null;
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <SyncOnReconnect />
        <ShareIntentHandler />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
