import { create } from 'zustand';
import { List } from '../types';

interface ListState {
  lists: List[];
  activeList: List | null;
  isLoading: boolean;
  error: string | null;
  setLists: (lists: List[]) => void;
  setActiveList: (list: List | null) => void;
  addList: (list: List) => void;
  updateListInStore: (listId: string, updatedFields: Partial<List>) => void;
  removeList: (listId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setOfflineCached: (listId: string, value: boolean) => void;
}

export const useListStore = create<ListState>((set) => ({
  lists: [],
  activeList: null,
  isLoading: false,
  error: null,
  setLists: (lists) => set({ lists, error: null }),
  setActiveList: (activeList) => set({ activeList }),
  addList: (newList) => set((state) => ({ lists: [newList, ...state.lists] })),
  updateListInStore: (listId, updatedFields) =>
    set((state) => ({
      lists: state.lists.map((l) => (l.id === listId ? { ...l, ...updatedFields } : l)),
      activeList:
        state.activeList?.id === listId
          ? { ...state.activeList, ...updatedFields }
          : state.activeList,
    })),
  removeList: (listId) =>
    set((state) => ({
      lists: state.lists.filter((l) => l.id !== listId),
      activeList: state.activeList?.id === listId ? null : state.activeList,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setOfflineCached: (listId, value) =>
    set((state) => ({
      lists: state.lists.map((l) =>
        l.id === listId ? { ...l, isOfflineCached: value } : l
      ),
      activeList:
        state.activeList?.id === listId
          ? { ...state.activeList, isOfflineCached: value }
          : state.activeList,
    })),
}));
