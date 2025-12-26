import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Movie } from '../../types';

interface Props {
  movie: Movie;
  onRemove?: () => void;
}

export default function DraggableSearchResult({ movie, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `pool-${movie.id}`,
    data: { movie, type: 'POOL_ITEM' },
  });

  return (
    <div className="relative group animate-fade-in-up">
      <motion.div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        layoutId={`pool-${movie.id}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        
        className={`relative aspect-[2/3] rounded-lg overflow-hidden cursor-grab active:cursor-grabbing border transition-all duration-300 shadow-lg ${
          isDragging 
            ? 'opacity-40 grayscale ring-2 ring-primary' 
            : 'border-white/10 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]'
        }`}
      >
        <img
          src={`${movie.poster_path}?v=1`}
          alt={movie.title}
          crossOrigin="anonymous"
          // OPTIMASI GAMBAR DISINI
          loading="lazy"
          decoding="async"
          // ----------------------
          className="w-full h-full object-cover pointer-events-none"
        />
        
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 to-transparent p-2 pt-6">
          <p className="text-[10px] text-center text-slate-200 font-medium truncate">
            {movie.title}
          </p>
        </div>
      </motion.div>

      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute -top-2 -right-2 z-10 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-red-600 border border-white/20"
          title="Remove from collection"
        >
          <X size={12} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}