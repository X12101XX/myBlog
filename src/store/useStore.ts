import { create } from 'zustand';
import type { Post, ViewMode, SortOption } from '@/types';

interface StoreState {
  // Archive
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  activeTag: string;
  setActiveTag: (t: string) => void;
  sortOption: SortOption;
  setSortOption: (s: SortOption) => void;

  // Search Overlay
  searchOpen: boolean;
  setSearchOpen: (o: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  recentSearches: string[];
  addRecentSearch: (q: string) => void;

  // Reading
  currentPage: number;
  setCurrentPage: (p: number) => void;
  totalPages: number;
  setTotalPages: (p: number) => void;
  zoomMode: 'fit-width' | 'fit-page' | number;
  setZoomMode: (z: 'fit-width' | 'fit-page' | number) => void;
  searchPanelOpen: boolean;
  setSearchPanelOpen: (o: boolean) => void;
  infoSidebarOpen: boolean;
  setInfoSidebarOpen: (o: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (o: boolean) => void;
  spreadMode: 'single' | 'double';
  setSpreadMode: (s: 'single' | 'double') => void;

  // Posts data
  posts: Post[];
  setPosts: (p: Post[]) => void;
}

export const useStore = create<StoreState>((set) => ({
  viewMode: 'grid',
  setViewMode: (v) => set({ viewMode: v }),
  activeTag: 'All',
  setActiveTag: (t) => set({ activeTag: t }),
  sortOption: 'newest',
  setSortOption: (s) => set({ sortOption: s }),

  searchOpen: false,
  setSearchOpen: (o) => set({ searchOpen: o }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  recentSearches: [],
  addRecentSearch: (q) =>
    set((state) => ({
      recentSearches: [q, ...state.recentSearches.filter((s) => s !== q)].slice(0, 5),
    })),

  currentPage: 1,
  setCurrentPage: (p) => set({ currentPage: p }),
  totalPages: 0,
  setTotalPages: (p) => set({ totalPages: p }),
  zoomMode: 'fit-width',
  setZoomMode: (z) => set({ zoomMode: z }),
  searchPanelOpen: false,
  setSearchPanelOpen: (o) => set({ searchPanelOpen: o }),
  infoSidebarOpen: false,
  setInfoSidebarOpen: (o) => set({ infoSidebarOpen: o }),
  settingsOpen: false,
  setSettingsOpen: (o) => set({ settingsOpen: o }),
  spreadMode: 'single',
  setSpreadMode: (s) => set({ spreadMode: s }),

  posts: [],
  setPosts: (p) => set({ posts: p }),
}));
