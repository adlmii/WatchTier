import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import type { Tier } from '../../types';
import DraggableMovie from './DraggableMovie';
import { cn } from '../../lib/utils';

interface TierRowProps {
  tier: Tier;
}

export default function TierRow({ tier }: TierRowProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: tier.id,
  });

  return (
    // Container Utama dengan efek Glass
    <div className="flex w-full mb-4 rounded-xl overflow-hidden glass-panel group transition-all duration-300 hover:border-white/10">
      
      {/* BAGIAN LABEL (S, A, B...) */}
      <div
        className="w-24 md:w-32 flex-shrink-0 flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: `${tier.color}15` }} // Transparan 15%
      >
        {/* Garis Warna Solid di Kiri */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: tier.color }} />
        
        {/* Teks Label */}
        <span 
          className="text-4xl md:text-5xl font-black tracking-tighter drop-shadow-lg"
          style={{ color: tier.color }}
        >
          {tier.label}
        </span>
      </div>

      {/* AREA DROP ZONE */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-wrap gap-3 p-4 min-h-[140px] transition-colors duration-300",
          // Efek saat ada item yang di-drag di atasnya (Highlight)
          isOver ? "bg-white/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" : "bg-transparent"
        )}
      >
        <SortableContext 
          items={tier.movies.map((m) => m.id)} 
          strategy={horizontalListSortingStrategy}
        >
          {tier.movies.map((movie) => (
            <div key={movie.id} className="w-24 md:w-28">
              <DraggableMovie movie={movie} />
            </div>
          ))}
        </SortableContext>
        
        {/* Placeholder Elegan */}
        {tier.movies.length === 0 && !isOver && (
          <div className="w-full h-full flex flex-col items-center justify-center opacity-20 pointer-events-none gap-2">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-400" />
            <span className="text-sm font-medium tracking-wide">DROP HERE</span>
          </div>
        )}
      </div>
    </div>
  );
}