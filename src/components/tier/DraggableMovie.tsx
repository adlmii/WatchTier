import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { X } from 'lucide-react'; // Import icon X
import type { Movie } from '../../types';
import { cn } from '../../lib/utils';

interface DraggableMovieProps {
  movie: Movie;
  onRemove?: () => void;
}

export default function DraggableMovie({ movie, onRemove }: DraggableMovieProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: movie.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative group aspect-[2/3] bg-slate-800 rounded-md overflow-hidden cursor-grab active:cursor-grabbing border border-transparent hover:border-white/50 transition-colors",
        isDragging && "opacity-20 z-0" 
      )}
    >
      <motion.img
        layoutId={`movie-${movie.id}`} 
        initial={{ scale: 0 }} 
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        
        src={`${movie.poster_path}?v=1`}
        alt={movie.title}
        crossOrigin="anonymous" 
        
        className="w-full h-full object-cover pointer-events-none"
      />
      
      <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />

      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          // Mencegah dnd-kit mengambil alih klik mouse
          onPointerDown={(e) => e.stopPropagation()} 
          className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-sm z-10"
          title="Unrank (Return to Collection)"
        >
          <X size={10} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}