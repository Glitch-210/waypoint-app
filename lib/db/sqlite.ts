import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('waypoint.db');
  await initSchema(db);
  return db;
}

async function initSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY NOT NULL,
      ownerId TEXT NOT NULL,
      name TEXT NOT NULL,
      coverImageUrl TEXT,
      isOfflineCached INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY NOT NULL,
      listId TEXT NOT NULL,
      name TEXT NOT NULL,
      lat REAL,
      lng REAL,
      address TEXT,
      notes TEXT,
      sourceUrl TEXT,
      sourceType TEXT NOT NULL DEFAULT 'manual',
      photoUrl TEXT,
      parseStatus TEXT NOT NULL DEFAULT 'manual',
      orderIndex INTEGER NOT NULL DEFAULT 0,
      inRoute INTEGER NOT NULL DEFAULT 0,
      addedById TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_places_listId ON places (listId);
  `);
}
