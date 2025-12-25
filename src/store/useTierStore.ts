import { create } from 'zustand';
import type { Movie, Tier, TierLabel } from '../types';
import { tmdb, IMAGE_BASE_URL } from '../lib/tmdb';

interface TierState {
  tiers: Tier[];
  searchResults: Movie[];
  isLoading: boolean;

  setSearchResults: (movies: Movie[]) => void;
  addMovieToTier: (movie: Movie, tierId: TierLabel) => void;
  searchMovies: (query: string) => Promise<void>;
  updateTierMovies: (tierId: TierLabel, newMovies: Movie[]) => void;
  removeMovieFromTier: (movieId: number, tierId: TierLabel) => void;
}

const initialTiers: Tier[] = [
  { id: 'S', label: 'S', color: '#ef4444', movies: [] },
  { id: 'A', label: 'A', color: '#f97316', movies: [] },
  { id: 'B', label: 'B', color: '#eab308', movies: [] },
  { id: 'C', label: 'C', color: '#84cc16', movies: [] },
  { id: 'D', label: 'D', color: '#22c55e', movies: [] },
];

export const useTierStore = create<TierState>((set) => ({
  tiers: initialTiers,
  searchResults: [],
  isLoading: false,

  setSearchResults: (movies) => set({ searchResults: movies }),

  addMovieToTier: (movie, tierId) =>
    set((state) => {
      const newTiers = state.tiers.map((tier) => {
        if (tier.id === tierId) {
          if (tier.movies.find((m) => m.id === movie.id)) return tier;
          return { ...tier, movies: [...tier.movies, movie] };
        }
        return tier;
      });
      return { tiers: newTiers };
    }),


  updateTierMovies: (tierId, newMovies) =>
    set((state) => ({
      tiers: state.tiers.map((tier) =>
        tier.id === tierId ? { ...tier, movies: newMovies } : tier
      ),
    })),

  removeMovieFromTier: (movieId, tierId) =>
    set((state) => ({
      tiers: state.tiers.map((tier) =>
        tier.id === tierId
          ? { ...tier, movies: tier.movies.filter((m) => m.id !== movieId) }
          : tier
      ),
    })),

  searchMovies: async (query) => {
    if (!query.trim()) { set({ searchResults: [] }); return; }
    set({ isLoading: true });
    try {
      const response = await tmdb.get('/search/movie', { params: { query } });
      const movies: Movie[] = response.data.results
        .filter((item: any) => item.poster_path)
        .map((item: any) => ({
          id: item.id,
          title: item.title,
          poster_path: `${IMAGE_BASE_URL}${item.poster_path}`,
        }));
      set({ searchResults: movies });
    } catch (error) { console.error(error); } 
    finally { set({ isLoading: false }); }
  },
}));