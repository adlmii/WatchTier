import { Plus, Check } from 'lucide-react';
import { useTierStore } from '../../store/useTierStore';
import type { Movie } from '../../types';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function MovieCard({ movie }: { movie: Movie }) {
  const addToPool = useTierStore((state) => state.addToPool);
  const moviesPool = useTierStore((state) => state.moviesPool);
  const tiers = useTierStore((state) => state.tiers);

  // Cek apakah film ini sudah ada di Pool atau Tier
  const isAdded = 
    moviesPool.some(m => m.id === movie.id) || 
    tiers.some(t => t.movies.some(m => m.id === movie.id));

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Mencegah navigasi ke detail saat klik tombol +
    e.stopPropagation();
    if (!isAdded) {
      addToPool(movie);
    }
  };

  return (
    <div className="relative group aspect-[2/3] rounded-xl overflow-hidden bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 transition-all hover:shadow-2xl hover:-translate-y-1">
      {/* Link ke Halaman Detail */}
      <Link to={`/movie/${movie.id}`} className="block w-full h-full">
        <img 
          src={movie.poster_path} 
          alt={movie.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        {/* Judul di Bawah */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-bold text-white truncate">{movie.title}</h3>
        </div>
      </Link>

      {/* Tombol Quick Add (Floating) */}
      <button
        onClick={handleAdd}
        disabled={isAdded}
        className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md border transition-all duration-300 z-10
          ${isAdded 
            ? 'bg-green-500/20 border-green-500 text-green-400 cursor-default' 
            : 'bg-black/40 border-white/20 text-white hover:bg-blue-600 hover:border-blue-500'
          }`}
      >
        {isAdded ? <Check size={16} /> : <Plus size={16} />}
      </button>
    </div>
  );
}