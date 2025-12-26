import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Flame, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchBar from '../components/search/SearchBar';
import MovieCard from '../components/movie/MovieCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import { useTierStore } from '../store/useTierStore';

const GENRES = [
  { id: null, name: 'Trending' },
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 27, name: 'Horror' },
  { id: 16, name: 'Anime' },
  { id: 878, name: 'Sci-Fi' },
  { id: 18, name: 'Drama' },
  { id: 53, name: 'Thriller' },
];

export default function Home() {
  const { 
    searchResults, 
    trendingMovies, 
    fetchTrending, 
    fetchMoviesByGenre, 
    activeGenre, 
    isLoading,
    currentPage 
  } = useTierStore();

  useEffect(() => {
    document.title = "WatchTier - Discover & Rank Movies";
  }, []);

  useEffect(() => {
    if (trendingMovies.length === 0) fetchTrending(1);
  }, []);

  const handleGenreClick = (genreId: number | null) => {
    if (genreId === null) {
      fetchTrending(1);
    } else {
      fetchMoviesByGenre(genreId, 1);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (activeGenre === null) {
      fetchTrending(newPage);
    } else {
      fetchMoviesByGenre(activeGenre, newPage);
    }
  };

  const isSearching = searchResults.length > 0;
  const displayMovies = isSearching ? searchResults : trendingMovies;

  const getSectionTitle = () => {
    if (isSearching) return 'Search Results';
    if (activeGenre === null) return 'Trending Now';
    return `${GENRES.find(g => g.id === activeGenre)?.name} Movies`;
  };

  return (
    <div className="relative min-h-screen bg-background text-white selection:bg-primary/30">
      
      {/* Background Ambient */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent opacity-60" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10 pb-24">
        
        {/* HEADER */}
        <header className="flex justify-between items-center py-6 mb-16 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <LayoutGrid className="text-white w-5 h-5" />
            </div>
            {/* --- GANTI TEKS LOGO --- */}
            <span className="text-2xl font-bold tracking-tight">
              Watch<span className="text-primary">Tier</span>
            </span>
          </div>
          
          <Link to="/tier-list" className="btn-secondary rounded-full px-6 backdrop-blur-md">
            <span>My Tier List</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-1" />
          </Link>
        </header>

        {/* HERO */}
        <div className="max-w-4xl mx-auto text-center mb-12 space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Discover. <br />
            <span className="bg-gradient-to-r from-primary via-blue-400 to-secondary bg-clip-text text-transparent">
              Collect & Rank.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Build your ultimate movie collection and rank them in your personal tier list on <b>WatchTier</b>.
          </p>
          <div className="pt-6">
            <SearchBar />
          </div>
        </div>

        {/* GENRE TABS */}
        {!isSearching && (
          <div className="flex flex-wrap justify-center gap-2 mb-16 animate-fade-in-up delay-100">
            {GENRES.map((genre) => {
              const isActive = activeGenre === genre.id;
              return (
                <button
                  key={genre.name}
                  onClick={() => handleGenreClick(genre.id)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${
                    isActive 
                      ? 'bg-primary border-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-105' 
                      : 'bg-surface border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {genre.name}
                </button>
              );
            })}
          </div>
        )}

        {/* CONTENT GRID */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isSearching ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
              {isSearching ? <Search className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
            </div>
            <h2 className="text-2xl font-bold text-white">{getSectionTitle()}</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in-up">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            ) : displayMovies.length > 0 ? (
              displayMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center opacity-50">
                 <p className="text-xl font-medium">No movies found</p>
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {!isSearching && displayMovies.length > 0 && !isLoading && (
            <div className="flex justify-center items-center gap-4 pt-12 animate-fade-in-up">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-secondary rounded-full w-12 h-12 flex items-center justify-center disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="px-6 py-3 rounded-full bg-surface border border-white/5 font-bold text-primary shadow-lg">
                Page {currentPage}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="btn-secondary rounded-full w-12 h-12 flex items-center justify-center disabled:opacity-30"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}