import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Star, Calendar, Clock, PlayCircle } from 'lucide-react';
import { tmdb, IMAGE_BASE_URL } from '../lib/tmdb';
import { useTierStore } from '../store/useTierStore';
import type { Movie } from '../types';
import MovieCard from '../components/movie/MovieCard';

interface MovieDetailData extends Movie {
  overview: string;
  vote_average: number;
  release_date: string;
  runtime: number;
  backdrop_path: string | null;
  genres: { id: number; name: string }[];
}

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToPool = useTierStore((state) => state.addToPool);
  
  const [movie, setMovie] = useState<MovieDetailData | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (movie) {
      document.title = `${movie.title} - WatchTier`;
    } else {
      document.title = "WatchTier";
    }
  }, [movie]);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await tmdb.get(`/movie/${id}`);
        setMovie({
          ...res.data,
          poster_path: `${IMAGE_BASE_URL}${res.data.poster_path}`,
          backdrop_path: res.data.backdrop_path ? `${IMAGE_BASE_URL}${res.data.backdrop_path}` : null
        });

        const recRes = await tmdb.get(`/movie/${id}/recommendations`);
        const recMovies = recRes.data.results
          .filter((item: any) => item.poster_path)
          .slice(0, 5)
          .map((item: any) => ({
            id: item.id,
            title: item.title,
            poster_path: `${IMAGE_BASE_URL}${item.poster_path}`,
          }));
        setRecommendations(recMovies);

      } catch (e) { 
        console.error(e); 
      } finally {
        setIsLoading(false);
      }
    };
    
    window.scrollTo(0, 0);
    if (id) fetchDetail();
  }, [id]);

  if (!movie && !isLoading) return <div className="h-screen flex items-center justify-center text-white">Movie not found</div>;
  if (isLoading) return <div className="h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary rounded-full animate-spin border-t-transparent" /></div>;

  return (
    <div className="relative min-h-screen bg-background text-white overflow-hidden font-sans pb-20">
      
      {/* Cinematic Backdrop */}
      <div className="absolute inset-0 -z-10">
        {movie?.backdrop_path && (
          <motion.img 
            key={movie.id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 1.5 }}
            src={movie.backdrop_path} 
            className="w-full h-full object-cover blur-sm"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10 pt-12">
        <button onClick={() => navigate(-1)} className="btn-secondary rounded-full mb-10 pl-3">
          <ArrowLeft size={18} /> Back
        </button>

        {movie && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-[350px_1fr] gap-12 items-start mb-20"
          >
            {/* Poster */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group">
              <img src={movie.poster_path} className="w-full h-auto object-cover" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
            </div>

            {/* Info */}
            <div className="space-y-8 pt-2">
              <div>
                <h1 className="text-5xl md:text-6xl font-black leading-none tracking-tight mb-4 text-white">
                  {movie.title}
                </h1>
                <div className="flex flex-wrap gap-3 text-sm font-semibold">
                  <Badge icon={<Star size={14} className="text-yellow-400" />} text={movie.vote_average.toFixed(1)} />
                  <Badge icon={<Calendar size={14} />} text={movie.release_date?.split('-')[0]} />
                  <Badge icon={<Clock size={14} />} text={`${movie.runtime} min`} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {movie.genres.map(g => (
                  <span key={g.id} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-bold text-slate-300">
                    {g.name}
                  </span>
                ))}
              </div>

              <div className="space-y-3 max-w-2xl">
                <h3 className="text-lg font-bold text-slate-200">Synopsis</h3>
                <p className="text-lg text-slate-400 leading-relaxed font-light">{movie.overview}</p>
              </div>

              <button 
                onClick={() => { addToPool(movie); navigate('/tier-list'); }}
                className="btn-primary px-8 py-4 text-lg flex items-center gap-3 mt-4"
              >
                <Plus size={24} /> 
                <span>Add to Collection</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* REKOMENDASI */}
        {recommendations.length > 0 && (
          <div className="pt-10 border-t border-white/5 animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <PlayCircle className="text-primary" /> You Might Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {recommendations.map((recMovie) => (
                <MovieCard key={recMovie.id} movie={recMovie} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function Badge({ icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-white/5 text-slate-300">
      {icon} <span>{text}</span>
    </div>
  );
}