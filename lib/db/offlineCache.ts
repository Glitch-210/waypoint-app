import { List, Place } from '../../types';
import { getDb } from './sqlite';

// ─── Lists ────────────────────────────────────────────────────────────────────

export async function cacheLists(lists: List[]): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const list of lists) {
      await db.runAsync(
        `INSERT OR REPLACE INTO lists
           (id, ownerId, name, coverImageUrl, isOfflineCached, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          list.id,
          list.ownerId,
          list.name,
          list.coverImageUrl ?? null,
          list.isOfflineCached ? 1 : 0,
          list.createdAt instanceof Date ? list.createdAt.toISOString() : list.createdAt,
          list.updatedAt instanceof Date ? list.updatedAt.toISOString() : list.updatedAt,
        ]
      );
    }
  });
}

export async function setListOfflineCached(listId: string, value: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE lists SET isOfflineCached = ? WHERE id = ?`,
    [value ? 1 : 0, listId]
  );
}

export async function getCachedLists(userId: string): Promise<List[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM lists WHERE ownerId = ? ORDER BY updatedAt DESC`,
    [userId]
  );
  return rows.map(rowToList);
}

export async function clearCacheForList(listId: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync(`DELETE FROM places WHERE listId = ?`, [listId]);
    await db.runAsync(`UPDATE lists SET isOfflineCached = 0 WHERE id = ?`, [listId]);
  });
}

// ─── Places ───────────────────────────────────────────────────────────────────

export async function cachePlaces(places: Place[]): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const place of places) {
      await db.runAsync(
        `INSERT OR REPLACE INTO places
           (id, listId, name, lat, lng, address, notes, sourceUrl, sourceType,
            photoUrl, parseStatus, orderIndex, inRoute, addedById, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          place.id,
          place.listId,
          place.name,
          place.lat ?? null,
          place.lng ?? null,
          place.address ?? null,
          place.notes ?? null,
          place.sourceUrl ?? null,
          place.sourceType,
          place.photoUrl ?? null,
          place.parseStatus,
          place.orderIndex,
          place.inRoute ? 1 : 0,
          place.addedById,
          place.createdAt instanceof Date ? place.createdAt.toISOString() : place.createdAt,
          place.updatedAt instanceof Date ? place.updatedAt.toISOString() : place.updatedAt,
        ]
      );
    }
  });
}

export async function getCachedPlaces(listId: string): Promise<Place[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM places WHERE listId = ? ORDER BY orderIndex ASC`,
    [listId]
  );
  return rows.map(rowToPlace);
}

// ─── Row mappers ──────────────────────────────────────────────────────────────

function rowToList(row: any): List {
  return {
    id: row.id,
    ownerId: row.ownerId,
    name: row.name,
    coverImageUrl: row.coverImageUrl ?? undefined,
    isOfflineCached: row.isOfflineCached === 1,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

function rowToPlace(row: any): Place {
  return {
    id: row.id,
    listId: row.listId,
    name: row.name,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    address: row.address ?? undefined,
    notes: row.notes ?? undefined,
    sourceUrl: row.sourceUrl ?? undefined,
    sourceType: row.sourceType,
    photoUrl: row.photoUrl ?? undefined,
    parseStatus: row.parseStatus,
    orderIndex: row.orderIndex,
    inRoute: row.inRoute === 1,
    addedById: row.addedById,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}
