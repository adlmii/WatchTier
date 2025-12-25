import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Movie } from '../../types';
import { cn } from '../../lib/utils';

interface DraggableMovieProps {
  movie: Movie;
}

export default function DraggableMovie({ movie }: DraggableMovieProps) {
  // Hook sakti dari dnd-kit
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
        "relative aspect-[2/3] bg-slate-800 rounded-md overflow-hidden cursor-grab active:cursor-grabbing border border-transparent hover:border-white transition-all",
        isDragging && "opacity-50 scale-105 z-50 ring-2 ring-blue-500"
      )}
    >
      <img
        src={movie.poster_path}
        alt={movie.title}
        className="w-full h-full object-cover pointer-events-none"
      />
    </div>
  );
}