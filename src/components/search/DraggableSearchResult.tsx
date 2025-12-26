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
    <div className="relative group">
      <motion.div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        layoutId={`pool-${movie.id}`}
        
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', damping: 15 }}

        className={`relative aspect-[2/3] rounded-lg overflow-hidden cursor-grab active:cursor-grabbing border border-white/10 hover:border-blue-500/50 hover:shadow-xl transition-all ${
          isDragging ? 'opacity-30 grayscale' : 'opacity-100'
        }`}
      >
        <img
          src={`${movie.poster_path}?v=1`}
          alt={movie.title}
          crossOrigin="anonymous"
          className="w-full h-full object-cover pointer-events-none"
        />
        
        {/* Overlay Judul */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/60 to-transparent p-2 pt-6">
          <p className="text-[10px] text-center text-white/90 font-medium truncate leading-tight">
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
          onPointerDown={(e) => e.stopPropagation()} // PENTING: Mencegah dnd-kit mengambil alih klik
          className="absolute -top-2 -right-2 z-10 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          title="Remove from collection"
        >
          <X size={12} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}