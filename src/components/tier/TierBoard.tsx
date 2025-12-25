import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTierStore } from '../../store/useTierStore';
import TierRow from './TierRow';
import SearchBar from '../search/SearchBar';
import DraggableSearchResult from '../search/DraggableSearchResult';
import type { Movie } from '../../types';

export default function TierBoard() {
  const tiers = useTierStore((state) => state.tiers);
  const searchResults = useTierStore((state) => state.searchResults);
  const addMovieToTier = useTierStore((state) => state.addMovieToTier);
  const updateTierMovies = useTierStore((state) => state.updateTierMovies);

  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  function handleDragOver(event: DragOverEvent) {
    const { over } = event; // FIX 3: Hapus 'active' dari sini karena belum dipakai
    if (!over) return;
    // Logic sorting real-time bisa ditambahkan di sini nanti jika ingin animasi lebih kompleks
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveMovie(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Skenario A: Drag dari SEARCH ke TIER
    if (active.data.current?.type === 'SEARCH_ITEM') {
      const movie = active.data.current.movie as Movie;
      
      let targetTierId = null;
      
      // Cek drop di container tier
      const targetTier = tiers.find(t => t.id === overId);
      if (targetTier) {
        targetTierId = targetTier.id;
      } else {
        // Cek drop di atas movie lain
        const tierWithMovie = tiers.find(t => t.movies.some(m => m.id === overId));
        if (tierWithMovie) targetTierId = tierWithMovie.id;
      }

      if (targetTierId) {
        addMovieToTier(movie, targetTierId as any);
      }
      return;
    }

    // Skenario B: Sorting dalam TIER yang sama
    const oldTier = tiers.find((t) => t.movies.some((m) => m.id === activeId));
    const newTier = tiers.find((t) => t.id === overId || t.movies.some((m) => m.id === overId));

    if (oldTier && newTier && oldTier.id === newTier.id) {
      const oldIndex = oldTier.movies.findIndex((m) => m.id === activeId);
      const newIndex = newTier.movies.findIndex((m) => m.id === overId);

      if (oldIndex !== newIndex && newIndex !== -1) {
        const newMovies = arrayMove(oldTier.movies, oldIndex, newIndex);
        updateTierMovies(oldTier.id, newMovies);
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-6xl mx-auto p-4 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            Movie Tier List Maker
          </h1>
          <p className="text-slate-400">Drag poster film ke baris peringkat!</p>
        </div>

        <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-2xl" id="tier-list-export">
          {tiers.map((tier) => (
            <TierRow key={tier.id} tier={tier} />
          ))}
        </div>

        <div className="mt-12">
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