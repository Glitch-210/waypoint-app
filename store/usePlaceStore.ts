import { create } from 'zustand';
import { Place } from '../types';

interface PlaceState {
  places: Place[];
  isLoading: boolean;
  error: string | null;
  setPlaces: (places: Place[]) => void;
  addPlace: (place: Place) => void;
  updatePlaceInStore: (placeId: string, updatedFields: Partial<Place>) => void;
  removePlace: (placeId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePlaceStore = create<PlaceState>((set) => ({
  places: [],
  isLoading: false,
  error: null,
  setPlaces: (places) => set({ places, error: null }),
  addPlace: (newPlace) => set((state) => ({ places: [...state.places, newPlace] })),
  updatePlaceInStore: (placeId, updatedFields) =>
    set((state) => ({
      places: state.places.map((p) => (p.id === placeId ? { ...p, ...updatedFields } : p)),
    })),
  removePlace: (placeId) =>
    set((state) => ({
      places: state.places.filter((p) => p.id !== placeId),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
