import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Movie, Tier, TierLabel } from '../types';
import { tmdb, IMAGE_BASE_URL } from '../lib/tmdb';

interface TierState {
  tiers: Tier[];
  moviesPool: Movie[];
  searchResults: Movie[];
  trendingMovies: Movie[];
  activeGenre: number | null;
  isLoading: boolean;

  // Actions
  searchMovies: (query: string) => Promise<void>;
  fetchTrending: () => Promise<void>;
  fetchMoviesByGenre: (genreId: number) => Promise<void>;
  setSearchResults: (movies: Movie[]) => void;
  
  addToPool: (movie: Movie) => void;
  removeFromPool: (movieId: number) => void;
  
  addMovieToTier: (movie: Movie, tierId: TierLabel) => void;
  updateTierMovies: (tierId: TierLabel, newMovies: Movie[]) => void;
  removeMovieFromTier: (movieId: number, tierId: TierLabel) => void;
  
  // Action Khusus
  unrankMovie: (movie: Movie, tierId: TierLabel) => void;
  resetTierList: () => void;
  resetAll: () => void;
}

const initialTiers: Tier[] = [
  { id: 'S', label: 'S', color: '#ef4444', movies: [] },
  { id: 'A', label: 'A', color: '#f97316', movies: [] },
  { id: 'B', label: 'B', color: '#eab308', movies: [] },
  { id: 'C', label: 'C', color: '#84cc16', movies: [] },
  { id: 'D', label: 'D', color: '#22c55e', movies: [] },
];

export const useTierStore = create<TierState>()(
  persist(
    (set, get) => ({
      tiers: initialTiers,
      moviesPool: [],
      searchResults: [],
      trendingMovies: [],
      activeGenre: null,
      isLoading: false,

      setSearchResults: (movies) => set({ searchResults: movies }),

      fetchTrending: async () => {
        set({ isLoading: true, activeGenre: null });
        try {
          const response = await tmdb.get('/trending/movie/week');
          const movies = response.data.results
            .filter((item: any) => item.poster_path)
            .map((item: any) => ({
              id: item.id,
              title: item.title,
              poster_path: `${IMAGE_BASE_URL}${item.poster_path}`,
            }));
          set({ trendingMovies: movies });
        } catch (error) {
          console.error('Gagal ambil trending:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMoviesByGenre: async (genreId) => {
        set({ isLoading: true, activeGenre: genreId });
        try {
          const response = await tmdb.get('/discover/movie', {
            params: {
              with_genres: genreId,
              sort_by: 'popularity.desc',
              include_adult: false,
              page: 1
            }
          });
          
          const movies = response.data.results
            .filter((item: any) => item.poster_path)
            .map((item: any) => ({
              id: item.id,
              title: item.title,
              poster_path: `${IMAGE_BASE_URL}${item.poster_path}`,
            }));
          set({ trendingMovies: movies });
        } catch (error) {
          console.error('Gagal ambil genre:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      searchMovies: async (query) => {
        if (!query.trim()) { set({ searchResults: [] }); return; }
        set({ isLoading: true });
        try {
          const response = await tmdb.get('/search/movie', { params: { query } });
          const movies = response.data.results
            .filter((item: any) => item.poster_path)
            .map((item: any) => ({
              id: item.id,
              title: item.title,
              poster_path: `${IMAGE_BASE_URL}${item.poster_path}`,
            }));
          set({ searchResults: movies });
        } catch (error) { console.error(error); set({ searchResults: [] }); } 
        finally { set({ isLoading: false }); }
      },

      addToPool: (movie) => set((state) => {
        if (state.moviesPool.some(m => m.id === movie.id)) return state;
        const isInTier = state.tiers.some(t => t.movies.some(m => m.id === movie.id));
        if (isInTier) return state;
        return { moviesPool: [movie, ...state.moviesPool] };
      }),

      removeFromPool: (movieId) => set((state) => ({
        moviesPool: state.moviesPool.filter((m) => m.id !== movieId)
      })),

      addMovieToTier: (movie, tierId) =>
        set((state) => {
          const newPool = state.moviesPool.filter(m => m.id !== movie.id);
          const newTiers = state.tiers.map((tier) => {
            if (tier.id === tierId) {
              if (!tier.movies.find(m => m.id === movie.id)) {
                return { ...tier, movies: [...tier.movies, movie] };
              }
            }
            if (tier.movies.find(m => m.id === movie.id)) {
              return { ...tier, movies: tier.movies.filter(m => m.id !== movie.id) };
            }
            return tier;
          });
          return { tiers: newTiers, moviesPool: newPool };
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
      
      // Action: Pindah dari Tier ke Pool (Safety Check Bypass)
      unrankMovie: (movie, tierId) => set((state) => {
        const newTiers = state.tiers.map((tier) => 
          tier.id === tierId 
            ? { ...tier, movies: tier.movies.filter(m => m.id !== movie.id) }
            : tier
        );

        const newPool = state.moviesPool.some(m => m.id === movie.id)
          ? state.moviesPool 
          : [movie, ...state.moviesPool];

        return { tiers: newTiers, moviesPool: newPool };
      }),

      // Action: Reset Ranking (Tier -> Pool)
      resetTierList: () => set((state) => {
        const allRankedMovies = state.tiers.flatMap(t => t.movies);
        const newPool = [...state.moviesPool];
        
        allRankedMovies.forEach(movie => {
          if (!newPool.find(m => m.id === movie.id)) {
            newPool.push(movie);
          }
        });

        const newTiers = state.tiers.map(t => ({ ...t, movies: [] }));

        return { tiers: newTiers, moviesPool: newPool };
      }),

      // Action: Hapus Semuanya
      resetAll: () => set({ tiers: initialTiers, moviesPool: [], searchResults: [] }),
    }),
    {
      name: 'movie-tier-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        tiers: state.tiers, 
        moviesPool: state.moviesPool 
      }),
    }
  )
);