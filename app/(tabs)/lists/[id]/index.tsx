import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePlaceStore } from '../../../../store/usePlaceStore';
import { useListStore } from '../../../../store/useListStore';
import { PlaceCard } from '../../../../components/places/PlaceCard';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { MaterialIcons } from '@expo/vector-icons';
import { getRoute, RouteGeometry } from '../../../../lib/services/mapboxService';
import { downloadTilePack, deleteTilePack } from '../../../../lib/services/offlineTilesService';
import { cachePlaces, getCachedPlaces, setListOfflineCached } from '../../../../lib/db/offlineCache';
import { useNetworkStatus } from '../../../../hooks/useNetworkStatus';
import { useUser } from '@clerk/expo';
import { RoomProvider, useOthers, useBroadcastEvent, useEventListener } from '../../../../lib/liveblocks';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <RoomProvider id={id} initialPresence={{ cursor: null }}>
      <ListDetailScreenContent id={id} />
    </RoomProvider>
  );
}

function ListDetailScreenContent({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useUser();
  const { lists, setOfflineCached } = useListStore();
  const { places, setPlaces, isLoading, setLoading, setError, updatePlaceInStore } = usePlaceStore();
  
  const [routeGeometry, setRouteGeometry] = useState<RouteGeometry | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const { isConnected } = useNetworkStatus();
  const others = useOthers();
  const broadcast = useBroadcastEvent();

  useEventListener(({ event }) => {
    if (event && (event as any).type === 'REFRESH_PLACES') {
      fetchPlaces();
    }
  });

  const fetchPlaces = async () => {
    if (!id || !user?.id) return;
    try {
      setLoading(true);
      if (isConnected) {
        // Online: fetch from Neon via API route, then write-through to SQLite
        const res = await fetch(`/api/places?listId=${encodeURIComponent(id)}&userId=${encodeURIComponent(user.id)}`);
        if (res.ok) {
          const data = await res.json();
          const placeList = data.places || [];
          setPlaces(placeList as any);
          await cachePlaces(placeList as any);
        }
      } else {
        // Offline: read from SQLite cache
        const cached = await getCachedPlaces(id);
        setPlaces(cached);
      }
    } catch (err) {
      console.error('Failed to fetch places:', err);
      setError('Failed to load places');
    } finally {
      setLoading(false);
    }
  };

  const list = lists.find(l => l.id === id);

  const isOwner = list?.ownerId === user?.id;
  const collaborator = list?.collaborators?.find((c: any) => c.userId === user?.id);
  const role = isOwner ? 'owner' : (collaborator?.role || 'viewer');
  // Mutations disabled when offline
  const canEdit = (role === 'owner' || role === 'editor') && isConnected;

  const handleToggleOffline = async () => {
    if (!list || !canEdit) return;
    if (list.isOfflineCached) {
      // Remove offline cache
      await deleteTilePack(id);
      await setListOfflineCached(id, false);
      setOfflineCached(id, false);
    } else {
      // Download for offline
      setIsDownloading(true);
      try {
        await cachePlaces(places);
        await downloadTilePack(id, places);
        await setListOfflineCached(id, true);
        setOfflineCached(id, true);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [id, user?.id, isConnected]);

  const routePlaces = useMemo(() => {
    return places.filter(p => p.inRoute && p.lat && p.lng).sort((a, b) => a.orderIndex - b.orderIndex);
  }, [places]);

  useEffect(() => {
    async function fetchRoute() {
      if (routePlaces.length < 2) {
        setRouteGeometry(null);
        return;
      }
      
      const coords = routePlaces.map(p => ({ lat: p.lat!, lng: p.lng! }));
      const geom = await getRoute(coords);
      setRouteGeometry(geom);
    }
    
    fetchRoute();
  }, [routePlaces]);

  const handleToggleRoute = async (placeId: string, currentInRoute: boolean) => {
    if (!user?.id) return;
    const newInRoute = !currentInRoute;
    // Optimistic update
    updatePlaceInStore(placeId, { inRoute: newInRoute });
    
    try {
      await fetch('/api/places', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, inRoute: newInRoute, userId: user.id }),
      });
      broadcast({ type: 'REFRESH_PLACES' });
    } catch (err) {
      // Revert if failed
      updatePlaceInStore(placeId, { inRoute: currentInRoute });
      console.error('Failed to toggle inRoute', err);
    }
  };

  if (!list) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>List not found</Text>
      </View>
    );
  }

  // Calculate bounds to focus the map initially
  const mapCenter: [number, number] = places.length > 0 && places[0].lat && places[0].lng 
    ? [places[0].lng, places[0].lat] 
    : [-122.4194, 37.7749];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{list.name}</Text>
        
        {/* Avatar Stack */}
        <View style={styles.avatarStack}>
          {others.slice(0, 3).map((other) => (
            <View key={other.connectionId} style={styles.avatarCircle}>
              <MaterialIcons name="person" size={16} color={colors.canvas} />
            </View>
          ))}
          {others.length > 3 && (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>+{others.length - 3}</Text>
            </View>
          )}
        </View>

        {/* Offline toggle — only owners/editors see this */}
        {(role === 'owner' || role === 'editor') && (
          <TouchableOpacity
            onPress={handleToggleOffline}
            disabled={isDownloading}
            style={styles.offlineButton}
          >
            <MaterialIcons
              name={isDownloading ? 'hourglass-empty' : list.isOfflineCached ? 'cloud-done' : 'cloud-download'}
              size={22}
              color={list.isOfflineCached ? colors.rausch : colors.muted}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Offline Banner */}
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <MaterialIcons name="wifi-off" size={14} color={colors.canvas} />
          <Text style={styles.offlineBannerText}>  You're offline — showing cached data</Text>
        </View>
      )}

      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#f0f0f0' }}>
            <Text style={{ color: colors.muted, textAlign: 'center', marginBottom: 4, fontWeight: 'bold' }}>MapLibre Native Map</Text>
            <Text style={{ color: colors.muted, textAlign: 'center', fontSize: 12 }}>Open in Android or iOS Development Build to view native map.</Text>
          </View>
        ) : process.env.EXPO_PUBLIC_MAPTILER_API_KEY ? (
          (() => {
            const { Map, Camera, Marker, GeoJSONSource, Layer } = require('@maplibre/maplibre-react-native');
            return (
              <Map
                style={styles.map}
                mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.EXPO_PUBLIC_MAPTILER_API_KEY}`}
              >
                <Camera
                  initialViewState={{
                    center: mapCenter,
                    zoom: 12,
                  }}
                />
                
                {routeGeometry && (
                  <GeoJSONSource id="routeSource" data={routeGeometry as any}>
                    <Layer
                      id="routeLine"
                      type="line"
                      style={{
                        lineColor: colors.rausch,
                        lineWidth: 4,
                        lineJoin: 'round',
                        lineCap: 'round'
                      }}
                    />
                  </GeoJSONSource>
                )}

                {places.filter(p => p.lat && p.lng).map((place) => {
                  const isRoutePlace = place.inRoute;
                  const routeIndex = routePlaces.findIndex(rp => rp.id === place.id) + 1;
                  
                  return (
                    <Marker
                      key={place.id}
                      lngLat={[place.lng!, place.lat!]}
                    >
                      <View style={[styles.marker, isRoutePlace ? styles.markerRoute : styles.markerInactive]}>
                        {isRoutePlace ? (
                          <Text style={styles.markerText}>{routeIndex}</Text>
                        ) : (
                          <View style={styles.markerDot} />
                        )}
                      </View>
                    </Marker>
                  );
                })}
              </Map>
            );
          })()
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#f0f0f0' }}>
            <Text style={{ color: colors.muted, textAlign: 'center' }}>MapTiler API Key required</Text>
          </View>
        )}
      </View>

      <View style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.rausch} />
          </View>
        ) : places.length === 0 ? (
          <View style={styles.centerContainer}>
            <View style={styles.emptyCard}>
              <MaterialIcons name="ios-share" size={36} color={colors.rausch} />
              <Text style={styles.emptyText}>No places yet</Text>
              <Text style={styles.emptySubText}>
                Share a link from Instagram, TikTok, or Google Maps and choose this list to add your first place.
              </Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={places}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PlaceCard 
                place={item} 
                onPress={() => {}} 
                onToggleRoute={() => handleToggleRoute(item.id, item.inRoute)}
                canEdit={canEdit}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      {canEdit && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push(`/lists/${id}/add`)}
        >
          <MaterialIcons name="add" size={28} color={colors.canvas} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    zIndex: 10,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontFamily: typography.bold,
    color: colors.ink,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.rausch,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
    borderWidth: 2,
    borderColor: colors.canvas,
  },
  avatarText: {
    fontSize: 10,
    color: colors.canvas,
    fontFamily: typography.bold,
  },
  offlineButton: {
    marginLeft: 8,
    padding: 4,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#555',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  offlineBannerText: {
    color: colors.canvas,
    fontFamily: typography.medium,
    fontSize: 12,
  },
  mapContainer: {
    flex: 0.4,
    backgroundColor: '#e0e0e0',
  },
  map: {
    flex: 1,
  },
  listContainer: {
    flex: 0.6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.primary,
    fontFamily: typography.medium,
  },
  emptyCard: {
    backgroundColor: colors.canvas,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: colors.hairline,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    color: colors.ink,
    fontFamily: typography.bold,
    marginTop: 4,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.muted,
    fontFamily: typography.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.rausch,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  markerRoute: {
    backgroundColor: colors.rausch,
  },
  markerInactive: {
    backgroundColor: colors.muted,
  },
  markerText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: typography.bold,
  },
  markerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  }
});
