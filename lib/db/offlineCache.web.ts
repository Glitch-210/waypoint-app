// Web stub — offline SQLite caching is a mobile-only feature.
// All functions are no-ops so the web bundle compiles cleanly.

import { List, Place } from '../../types';

export async function cacheLists(_lists: List[]): Promise<void> {}
export async function setListOfflineCached(_listId: string, _value: boolean): Promise<void> {}
export async function getCachedLists(_userId: string): Promise<List[]> { return []; }
export async function clearCacheForList(_listId: string): Promise<void> {}
export async function cachePlaces(_places: Place[]): Promise<void> {}
export async function getCachedPlaces(_listId: string): Promise<Place[]> { return []; }
