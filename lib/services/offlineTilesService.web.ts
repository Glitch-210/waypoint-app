// Web stub — @rnmapbox/maps offline tile packs are a mobile-only feature.
// All functions are no-ops so the web bundle compiles cleanly.

import { Place } from '../../types';

export async function downloadTilePack(_listId: string, _places: Place[]): Promise<void> {}
export async function deleteTilePack(_listId: string): Promise<void> {}
