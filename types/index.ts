export interface User {
  id: string;
  googleId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface List {
  id: string;
  ownerId: string;
  name: string;
  coverImageUrl?: string;
  isOfflineCached: boolean;
  createdAt: Date;
  updatedAt: Date;
  owner?: { id: string; name?: string; avatarUrl?: string };
  collaborators?: ListCollaborator[];
}

export interface ListCollaborator {
  listId: string;
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  invitedAt: Date;
}

export interface Place {
  id: string;
  listId: string;
  name: string;
  lat?: number;
  lng?: number;
  address?: string;
  notes?: string;
  sourceUrl?: string;
  sourceType: 'instagram' | 'tiktok' | 'youtube' | 'maps' | 'manual';
  photoUrl?: string;
  parseStatus: 'parsed' | 'manual' | 'failed';
  orderIndex: number;
  inRoute: boolean;
  addedById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedPlaceCandidate {
  name: string;
  lat?: number;
  lng?: number;
  address?: string;
  photoUrl?: string;
  sourceUrl?: string;
  sourceType: Place['sourceType'];
  parseStatus: Place['parseStatus'];
  confidence: number;
}
