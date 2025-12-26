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
  
  // Ambil Actions Reset
  const resetTierList = useTierStore((state) => state.resetTierList);
  const resetAll = useTierStore((state) => state.resetAll);
  
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

    // Skenario 1: Dari Pool (Unranked) -> Masuk ke Tier
    if (active.data.current?.type === 'POOL_ITEM' || active.data.current?.type === 'SEARCH_ITEM') {
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

  // Helper untuk cek state tombol
  const hasRankedMovies = tiers.some(t => t.movies.length > 0);
  const hasAnyMovies = moviesPool.length > 0 || hasRankedMovies;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative min-h-screen">
        
        {/* BACKGROUND AMBIENT LIGHT */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
          
          {/* HEADER DENGAN NAVIGASI */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
            <div className="flex items-center gap-6 w-full md:w-auto">
              {/* Tombol Back */}
              <Link to="/" className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all hover:scale-105">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              
              <div className="text-left">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Ranking Board
                  </span>
                </h1>
                <p className="text-slate-400 text-sm font-medium">Drag from collection to rank</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              
              {/* 1. TOMBOL RESET RANKING (Aman - Simpan Koleksi) */}
              <button
                onClick={() => {
                  if (window.confirm('Reset ranking positions? Movies will return to collection.')) {
                    resetTierList();
                  }
                }}
                disabled={!hasRankedMovies}
                className="p-3 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Reset Board (Keep Collection)"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* 2. TOMBOL DELETE ALL (Bahaya - Hapus Semuanya) */}
              <button
                onClick={() => {
                  if (window.confirm('WARNING: This will delete ALL movies and start over. Are you sure?')) {
                    resetAll();
                  }
                }}
                disabled={!hasAnyMovies}
                className="p-3 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Delete Everything (Start New)"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <div className="w-px h-8 bg-white/10 mx-2 hidden md:block" />

              {/* Tombol Export */}
              <button
                onClick={() => takeScreenshot('tier-list-export')}
                disabled={isDownloading}
                className="group relative px-6 py-2.5 bg-white text-black rounded-full font-bold transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden whitespace-nowrap"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <div className="flex items-center gap-2">
                  {isDownloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Save Image</span>
                </div>
              </button>
            </div>
          </div>

          {/* BOARD AREA (TIER LIST) */}
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

          {/* POOL AREA (UNRANKED COLLECTION) */}
          <div className="mt-12 pt-8 border-t border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Unranked Collection 
                <span className="ml-3 text-sm font-normal text-slate-500 bg-slate-800 px-2 py-1 rounded-md">
                  {moviesPool.length} items
                </span>
              </h3>
            </div>
            
            {moviesPool.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30 text-center">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                  <Layers className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400 font-medium mb-2">Your collection is empty</p>
                <p className="text-slate-600 text-sm mb-6">Go back to home to discover and add movies.</p>
                <Link to="/" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors">
                  Find Movies
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4 animate-fade-in-up">
                {moviesPool.map((movie) => (
                  <DraggableSearchResult 
                    key={movie.id} 
                    movie={movie}
                    onRemove={() => removeFromPool(movie.id)}
                  />
                ))}
              </div>
            )}
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