import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'; // Hapus DragOverEvent
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Download, Loader2 } from 'lucide-react';

import { useTierStore } from '../../store/useTierStore';
import TierRow from './TierRow';
import SearchBar from '../search/SearchBar';
import DraggableSearchResult from '../search/DraggableSearchResult';
import type { Movie, Tier } from '../../types';
import { useScreenshot } from '../../hooks/useScreenshot';

export default function TierBoard() {
  const tiers = useTierStore((state) => state.tiers);
  const searchResults = useTierStore((state) => state.searchResults);
  const addMovieToTier = useTierStore((state) => state.addMovieToTier);
  const updateTierMovies = useTierStore((state) => state.updateTierMovies);
  
  const { takeScreenshot, isDownloading } = useScreenshot();

  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, 
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function findTier(id: string | number): Tier | undefined {
    const tierById = tiers.find((t) => t.id === id);
    if (tierById) return tierById;
    return tiers.find((t) => t.movies.some((m) => m.id === id));
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const data = active.data.current;

    if (data?.movie) {
      setActiveMovie(data.movie);
    } else {
      const allMovies = tiers.flatMap((t) => t.movies);
      const found = allMovies.find((m) => m.id === active.id);
      if (found) setActiveMovie(found);
    }
  }


  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveMovie(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Skenario 1: Search -> Tier
    if (active.data.current?.type === 'SEARCH_ITEM') {
      const movie = active.data.current.movie as Movie;
      const targetTier = findTier(overId);

      if (targetTier) {
        addMovieToTier(movie, targetTier.id);
      }
      return;
    }

    // Skenario 2 & 3: Pindah Antar Tier / Dalam Tier
    const activeTier = findTier(activeId);
    const overTier = findTier(overId);

    if (!activeTier || !overTier) return;

    // A. Sorting dalam Tier sama
    if (activeTier.id === overTier.id) {
      const oldIndex = activeTier.movies.findIndex((m) => m.id === activeId);
      const newIndex = overTier.movies.findIndex((m) => m.id === overId);

      if (oldIndex !== newIndex && newIndex !== -1) {
        const newMovies = arrayMove(activeTier.movies, oldIndex, newIndex);
        updateTierMovies(activeTier.id, newMovies);
      }
    } 
    // B. Pindah beda Tier
    else {
      const movieToMove = activeTier.movies.find((m) => m.id === activeId);
      if (!movieToMove) return;

      // Hapus dari lama
      const newActiveTierMovies = activeTier.movies.filter((m) => m.id !== activeId);
      updateTierMovies(activeTier.id, newActiveTierMovies);

      // Masuk ke baru
      const newOverTierMovies = [...overTier.movies];
      const overIndex = overTier.movies.findIndex((m) => m.id === overId);
      
      if (overIndex >= 0) {
        newOverTierMovies.splice(overIndex, 0, movieToMove);
      } else {
        newOverTierMovies.push(movieToMove);
      }

      updateTierMovies(overTier.id, newOverTierMovies);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection} 
      onDragStart={handleDragStart}
      // onDragOver DIHAPUS DARI SINI
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-6xl mx-auto p-4 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Movie Tier List
            </h1>
            <p className="text-slate-400 text-sm">Drag poster film ke baris peringkat!</p>
          </div>

          <button
            onClick={() => takeScreenshot('tier-list-export')}
            disabled={isDownloading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download Image
              </>
            )}
          </button>
        </div>

        {/* BOARD AREA */}
        <div 
          id="tier-list-export"
          className="space-y-2 bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-2xl"
        >
          {tiers.map((tier) => (
            <TierRow key={tier.id} tier={tier} />
          ))}
          
          <div className="text-center text-slate-700 text-xs pt-4 font-mono uppercase tracking-widest opacity-50">
            Created with My Tier List Maker
          </div>
        </div>

        {/* SEARCH AREA */}
        <div className="mt-12 border-t border-slate-800 pt-8">
          <SearchBar />
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 min-h-[100px]">
            {searchResults.map((movie) => (
              <DraggableSearchResult key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeMovie ? (
          <div className="w-24 opacity-80 rotate-6 shadow-2xl cursor-grabbing">
             <img src={activeMovie.poster_path} className="rounded-md" />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}