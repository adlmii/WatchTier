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
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
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

    if (activeTier.id === overTier.id) {
      const oldIndex = activeTier.movies.findIndex((m) => m.id === activeId);
      const newIndex = overTier.movies.findIndex((m) => m.id === overId);

      if (oldIndex !== newIndex && newIndex !== -1) {
        const newMovies = arrayMove(activeTier.movies, oldIndex, newIndex);
        updateTierMovies(activeTier.id, newMovies);
      }
    } 
    else {
      const movieToMove = activeTier.movies.find((m) => m.id === activeId);
      if (!movieToMove) return;

      const newActiveTierMovies = activeTier.movies.filter((m) => m.id !== activeId);
      updateTierMovies(activeTier.id, newActiveTierMovies);

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
      onDragEnd={handleDragEnd}
    >
      <div className="relative min-h-screen">
        
        {/* BACKGROUND AMBIENT LIGHT (EFEK CAHAYA) */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-5xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  RankMyMovie
                </span>
                <span className="text-slate-500 text-2xl ml-2 font-light">.app</span>
              </h1>
              <p className="text-slate-400 font-medium">Create your ultimate movie tier list</p>
            </div>

            <button
              onClick={() => takeScreenshot('tier-list-export')}
              disabled={isDownloading}
              className="group relative px-8 py-3 bg-white text-black rounded-full font-bold transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer" />
              <div className="flex items-center gap-2">
                {isDownloading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                <span>Export Image</span>
              </div>
            </button>
          </div>

          {/* BOARD AREA */}
          <div 
            id="tier-list-export"
            className="p-6 md:p-8 rounded-3xl bg-[#0B0E14] border border-white/5 shadow-2xl"
          >
            {tiers.map((tier) => (
              <TierRow key={tier.id} tier={tier} />
            ))}
            
            <div className="flex items-center justify-center gap-2 mt-6 opacity-30">
              <div className="h-px w-12 bg-white" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Created with RankMyMovie</span>
              <div className="h-px w-12 bg-white" />
            </div>
          </div>

          {/* SEARCH AREA */}
          <div className="mt-20">
            <SearchBar />
            
            <div className="mt-8">
               {searchResults.length > 0 && (
                 <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4 pl-2">Search Results</h3>
               )}
               <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 min-h-[100px]">
                {searchResults.map((movie) => (
                  <DraggableSearchResult key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeMovie ? (
          <div className="w-28 opacity-90 rotate-3 scale-110 shadow-2xl shadow-black/50 cursor-grabbing">
             <img src={`${activeMovie.poster_path}?v=1`} className="rounded-lg border-2 border-white/20" />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}