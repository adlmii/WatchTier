import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Animasi
import { ArrowLeft, Plus, Star, Calendar, Clock, Tag } from 'lucide-react';
import { tmdb, IMAGE_BASE_URL } from '../lib/tmdb';
import { useTierStore } from '../store/useTierStore';
import type { Movie } from '../types';

interface MovieDetailData extends Movie {
  overview: string;
  vote_average: number;
  release_date: string;
  runtime: number;
  backdrop_path: string | null; // Tambahan untuk background besar
  genres: { id: number; name: string }[];
}

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToPool = useTierStore((state) => state.addToPool);
  
  const [movie, setMovie] = useState<MovieDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await tmdb.get(`/movie/${id}`);
        setMovie({
          ...res.data,
          poster_path: `${IMAGE_BASE_URL}${res.data.poster_path}`,
          backdrop_path: res.data.backdrop_path 
            ? `${IMAGE_BASE_URL}${res.data.backdrop_path}` 
            : null
        });
      } catch (error) {
        console.error("Gagal ambil detail", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const handleAddToRank = () => {
    if (movie) {
      addToPool({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path
      });
      navigate('/tier-list');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) return <div className="text-center p-20 text-white">Movie not found</div>;

  return (
    <div className="relative min-h-screen bg-[#0B0E14] text-white overflow-hidden">
      
      {/* 1. CINEMATIC BACKDROP (Background Gambar Buram) */}
      <div className="absolute inset-0 -z-10">
        {movie.backdrop_path ? (
          <>
            <img 
              src={movie.backdrop_path} 
              alt="Backdrop" 
              className="w-full h-full object-cover opacity-30 blur-sm scale-110"
            />
            {/* Gradient Overlay biar teks terbaca */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/50 to-transparent" />
          </>
        ) : (
          // Fallback kalau gak ada backdrop
          <div className="w-full h-full bg-slate-900" />
        )}
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10">
        
        {/* Tombol Back */}
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/5 hover:border-white/20 transition-all mb-8"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="font-medium">Back</span>
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-[350px_1fr] gap-10 lg:gap-16 items-start"
        >
          {/* 2. POSTER (Glass Effect Border) */}
          <div className="relative rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 group">
             <img 
               src={movie.poster_path} 
               alt={movie.title} 
               className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" 
             />
          </div>

          {/* 3. INFORMASI DETAIL */}
          <div className="space-y-8 pt-4">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                {movie.title}
              </h1>
              
              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-300">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-lg border border-yellow-500/20">
                  <Star size={16} fill="currentColor" /> 
                  {movie.vote_average.toFixed(1)}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                  <Calendar size={16} /> 
                  {movie.release_date?.split('-')[0] || 'N/A'}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                  <Clock size={16} /> 
                  {movie.runtime} min
                </div>
              </div>

              {/* Genre Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {movie.genres.map(g => (
                  <span key={g.id} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-white/5 text-slate-300 border border-white/5">
                    <Tag size={12} /> {g.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Sinopsis */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full" />
                Overview
              </h3>
              <p className="text-lg text-slate-300 leading-relaxed font-light">
                {movie.overview || "No overview available."}
              </p>
            </div>

            {/* ACTION BUTTON (Premium Style) */}
            <div className="pt-4">
              <button 
                onClick={handleAddToRank}
                className="group relative px-8 py-4 bg-white text-black rounded-xl font-bold text-lg flex items-center gap-3 overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <Plus size={24} className="group-hover:rotate-90 transition-transform" /> 
                Add to Collection
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}