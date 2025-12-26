import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Download, Loader2, ArrowLeft, Layers, RotateCcw, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useTierStore } from '../../store/useTierStore';
import TierRow from './TierRow';
import DraggableSearchResult from '../search/DraggableSearchResult';
import type { Movie, Tier } from '../../types';
import { useScreenshot } from '../../hooks/useScreenshot';

export default function TierBoard() {
  const moviesPool = useTierStore((state) => state.moviesPool);
  const tiers = useTierStore((state) => state.tiers);
  const addMovieToTier = useTierStore((state) => state.addMovieToTier);
  const updateTierMovies = useTierStore((state) => state.updateTierMovies);
  const removeFromPool = useTierStore((state) => state.removeFromPool);
  
  const resetTierList = useTierStore((state) => state.resetTierList);
  const resetAll = useTierStore((state) => state.resetAll);
  
  const { takeScreenshot, isDownloading } = useScreenshot();
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);

  useEffect(() => {
    document.title = "WatchTier - My Ranking Board";
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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

    if (active.data.current?.type === 'POOL_ITEM' || active.data.current?.type === 'SEARCH_ITEM') {
      const movie = active.data.current.movie as Movie;
      const targetTier = findTier(overId);
      if (targetTier) addMovieToTier(movie, targetTier.id);
      return;
    }

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
    } else {
      const movieToMove = activeTier.movies.find((m) => m.id === activeId);
      if (!movieToMove) return;
      
      const newActiveTierMovies = activeTier.movies.filter((m) => m.id !== activeId);
      updateTierMovies(activeTier.id, newActiveTierMovies);

      const newOverTierMovies = [...overTier.movies];
      const overIndex = overTier.movies.findIndex((m) => m.id === overId);
      if (overIndex >= 0) newOverTierMovies.splice(overIndex, 0, movieToMove);
      else newOverTierMovies.push(movieToMove);
      updateTierMovies(overTier.id, newOverTierMovies);
    }
  }

  const hasRankedMovies = tiers.some(t => t.movies.length > 0);
  const hasAnyMovies = moviesPool.length > 0 || hasRankedMovies;

  return (
    <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="relative min-h-screen pb-20">
        
        {/* Background Glow Ambient */}
        <div className="fixed inset-0 pointer-events-none -z-10">
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
          
          {/* --- HEADER --- */}
          <div className="flex flex-col xl:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
            <div className="flex items-center gap-6 w-full xl:w-auto">
              <Link to="/" className="p-3 rounded-full bg-surface hover:bg-white/10 text-slate-400 hover:text-white transition-all hover:scale-105 border border-white/5">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="text-left">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                  Ranking Board
                </h1>
                <p className="text-slate-400 text-sm font-medium mt-1">Drag and drop to rank your collection</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Reset Ranking */}
              <button
                onClick={() => window.confirm('Reset ranking positions?') && resetTierList()}
                disabled={!hasRankedMovies}
                className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                title="Reset Ranking"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-semibold">Reset</span>
              </button>

              {/* Delete All */}
              <button
                onClick={() => window.confirm('Delete EVERYTHING?') && resetAll()}
                disabled={!hasAnyMovies}
                className="btn-secondary hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 disabled:opacity-30"
                title="Delete Everything"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="w-px h-8 bg-white/10 mx-1 hidden sm:block" />

              {/* Export Button (Primary) */}
              <button
                onClick={() => takeScreenshot('tier-list-export')}
                disabled={isDownloading}
                className="btn-primary px-6 py-2.5 flex items-center gap-2"
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span className="text-sm">Save Image</span>
                {/* Shimmer Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />
              </button>
            </div>
          </div>

          {/* --- TIER BOARD AREA --- */}
          <div 
            id="tier-list-export"
            className="p-1 rounded-3xl bg-gradient-to-b from-white/5 to-transparent shadow-2xl"
          >
            <div className="p-6 md:p-8 bg-[#0B0E14]/90 backdrop-blur-sm rounded-[20px] border border-white/5">
                {tiers.map((tier) => (
                <TierRow key={tier.id} tier={tier} />
                ))}
                
                {/* Watermark Minimalis (UPDATED) */}
                <div className="flex items-center justify-center gap-3 mt-8 opacity-20">
                <div className="h-px w-16 bg-white" />
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white">WatchTier</span>
                <div className="h-px w-16 bg-white" />
                </div>
            </div>
          </div>

          {/* --- UNRANKED COLLECTION --- */}
          <div className="mt-12 pt-8 border-t border-white/5">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-surface border border-white/5 rounded-xl text-primary shadow-lg shadow-primary/10">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Unranked Collection</h3>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                    {moviesPool.length} Items Available
                  </p>
              </div>
            </div>
            
            {moviesPool.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10 bg-transparent">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 text-slate-600">
                  <Layers className="w-8 h-8" />
                </div>
                <p className="text-slate-400 font-medium">Your collection is empty</p>
                <Link to="/" className="mt-4 text-primary hover:text-primary/80 font-bold text-sm hover:underline underline-offset-4">
                  + Add Movies
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4 px-2">
                {moviesPool.map((movie) => (
                  <div key={movie.id} className="animate-fade-in-up">
                      <DraggableSearchResult 
                        movie={movie}
                        onRemove={() => removeFromPool(movie.id)}
                      />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
      <DragOverlay>
        {activeMovie ? (
          <div className="w-28 rotate-3 scale-110 shadow-2xl shadow-black/80 cursor-grabbing ring-2 ring-primary/50 rounded-lg overflow-hidden">
             <img src={`${activeMovie.poster_path}?v=1`} className="w-full h-full object-cover" />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}