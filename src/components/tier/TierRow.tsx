import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import type { Tier } from '../../types';
import DraggableMovie from './DraggableMovie';
import { cn } from '../../lib/utils';

interface TierRowProps {
  tier: Tier;
}

export default function TierRow({ tier }: TierRowProps) {
  // Menjadikan baris ini sebagai area 'Droppable'
  const { setNodeRef } = useDroppable({
    id: tier.id,
  });

  return (
    <div className="flex w-full mb-2 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden min-h-[120px]">
      <div
        className="w-24 flex-shrink-0 flex items-center justify-center text-3xl font-black text-black shadow-lg z-10"
        style={{ backgroundColor: tier.color }}
      >
        {tier.label}
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-wrap gap-2 p-3 bg-slate-800/50 transition-colors",
        )}
      >
        <SortableContext 
          items={tier.movies.map((m) => m.id)} 
          strategy={horizontalListSortingStrategy}
        >
          {tier.movies.map((movie) => (
            <div key={movie.id} className="w-20">
              <DraggableMovie movie={movie} />
            </div>
          ))}
        </SortableContext>
        
        {tier.movies.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm italic pointer-events-none">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}