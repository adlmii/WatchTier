import { useDraggable } from '@dnd-kit/core';
import type { Movie } from '../../types';

export default function DraggableSearchResult({ movie }: { movie: Movie }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `search-${movie.id}`,
    data: { movie, type: 'SEARCH_ITEM' },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`relative aspect-[2/3] rounded-lg overflow-hidden cursor-grab active:cursor-grabbing border border-slate-700 hover:border-blue-500 transition-all ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <img
        src={movie.poster_path}
        alt={movie.title}
        className="w-full h-full object-cover"
      />
      {/* Overlay judul kecil */}
      <div className="absolute bottom-0 w-full bg-black/60 p-1">
        <p className="text-xs text-center text-white truncate">{movie.title}</p>
      </div>
    </div>
  );
}