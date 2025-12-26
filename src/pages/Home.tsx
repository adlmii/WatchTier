import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Flame, Search, Compass } from 'lucide-react';
import SearchBar from '../components/search/SearchBar';
import MovieCard from '../components/movie/MovieCard';
import { useTierStore } from '../store/useTierStore';

// Daftar Kategori Populer (ID dari TMDB)
const GENRES = [
  { id: null, name: 'Trending 🔥' },
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 27, name: 'Horror' },
  { id: 16, name: 'Animation' },
  { id: 878, name: 'Sci-Fi' },
  { id: 18, name: 'Drama' },
  { id: 10749, name: 'Romance' },
  { id: 53, name: 'Thriller' },
];

export default function Home() {
  const searchResults = useTierStore((state) => state.searchResults);
  const trendingMovies = useTierStore((state) => state.trendingMovies);
  
  const fetchTrending = useTierStore((state) => state.fetchTrending);
  const fetchMoviesByGenre = useTierStore((state) => state.fetchMoviesByGenre);
  const activeGenre = useTierStore((state) => state.activeGenre);
  const isLoading = useTierStore((state) => state.isLoading);

  useEffect(() => {
    if (trendingMovies.length === 0) {
        fetchTrending();
    }
  }, []);

  const handleGenreClick = (genreId: number | null) => {
    if (genreId === null) {
      fetchTrending();
    } else {
      fetchMoviesByGenre(genreId);
    }
  };

  const isSearching = searchResults.length > 0;
  const displayMovies = isSearching ? searchResults : trendingMovies;

  // Tentukan Label Judul Section
  const getSectionTitle = () => {
    if (isSearching) return 'Search Results';
    if (activeGenre === null) return 'Trending This Week';
    return `${GENRES.find(g => g.id === activeGenre)?.name} Movies`;
  };

  return (
    <div className="relative min-h-screen bg-[#0B0E14] text-white overflow-x-hidden selection:bg-blue-500/30">
      
      {/* BACKGROUND AMBIENT LIGHT */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10 pb-24">
        
        {/* HEADER */}
        <header className="flex justify-between items-center py-6 mb-12">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <LayoutGrid className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              MoviePool
            </span>
          </div>
          
          <Link 
            to="/tier-list" 
            className="group px-6 py-2.5 bg-white/5 border border-white/10 rounded-full font-medium hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105 backdrop-blur-md flex items-center gap-2"
          >
            <span>My Rank List</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse group-hover:shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          </Link>
        </header>

        {/* HERO SECTION */}
        <div className="max-w-3xl mx-auto text-center mb-10 space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Discover. <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Collect & Rank.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Search for your favorite movies, add them to your collection pool, and create the ultimate tier list ranking.
          </p>
          
          <div className="pt-4">
            <SearchBar />
          </div>
        </div>

        {/* GENRE CHIPS (Hanya muncul jika TIDAK sedang search) */}
        {!isSearching && (
          <div className="flex flex-wrap justify-center gap-2 mb-12 animate-fade-in-up">
            {GENRES.map((genre) => {
              const isActive = activeGenre === genre.id;
              return (
                <button
                  key={genre.name}
                  onClick={() => handleGenreClick(genre.id)}
                  disabled={isLoading}
                  className={`
                    px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border
                    ${isActive 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25 scale-105' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20'
                    }
                  `}
                >
                  {genre.name}
                </button>
              );
            })}
          </div>
        )}

        {/* CONTENT GRID */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-8">
            {/* Ikon Dinamis */}
            {isSearching ? (
               <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                 <Search className="w-6 h-6" />
               </div>
            ) : activeGenre === null ? (
               <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                 <Flame className="w-6 h-6" />
               </div>
            ) : (
               <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                 <Compass className="w-6 h-6" />
               </div>
            )}
            
            <h2 className="text-2xl font-bold">
              {getSectionTitle()}
            </h2>
            
            {isLoading && (
              <span className="ml-auto text-sm text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                Updating...
              </span>
            )}
          </div>

          {displayMovies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8 animate-fade-in-up">
              {displayMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 opacity-50">
               <p className="text-xl font-medium">No movies found.</p>
               <p className="text-sm">Try searching for something else.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}