import { Plus, Check } from 'lucide-react';
import { useTierStore } from '../../store/useTierStore';
import type { Movie } from '../../types';
import { Link } from 'react-router-dom';

export default function MovieCard({ movie }: { movie: Movie }) {
  const addToPool = useTierStore((state) => state.addToPool);
  const moviesPool = useTierStore((state) => state.moviesPool);
  const tiers = useTierStore((state) => state.tiers);

  const isAdded = 
    moviesPool.some(m => m.id === movie.id) || 
    tiers.some(t => t.movies.some(m => m.id === movie.id));

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (!isAdded) addToPool(movie);
  };

  return (
    <div className="relative group aspect-[2/3] rounded-xl overflow-hidden bg-surface border border-white/5 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:-translate-y-2">
      <Link to={`/movie/${movie.id}`} className="block w-full h-full">
        <img 
          src={movie.poster_path} 
          alt={movie.title}
          // OPTIMASI GAMBAR DISINI
          loading="lazy" 
          decoding="async" 
          // ----------------------
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-sm font-bold text-white truncate leading-tight drop-shadow-md">
            {movie.title}
          </h3>
          <p className="text-[10px] text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-wider mt-1">
            View Details
          </p>
        </div>
      </Link>

      <button
        onClick={handleAdd}
        disabled={isAdded}
        className={`absolute top-2 right-2 p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 z-10 shadow-lg
          ${isAdded 
            ? 'bg-green-500/20 border-green-500 text-green-400 cursor-default' 
            : 'bg-black/40 border-white/20 text-white hover:bg-primary hover:border-primary hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]'
          }`}
      >
        {isAdded ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
      </button>
    </div>
  );
}