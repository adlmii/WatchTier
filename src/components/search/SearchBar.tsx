import { useEffect, useState } from 'react';
import { Search, Loader2 } from 'lucide-react'; // Ikon
import { useTierStore } from '../../store/useTierStore';
import { useDebounce } from '../../hooks/useDebounce';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  // Tunggu 500ms setelah user berhenti mengetik
  const debouncedQuery = useDebounce(query, 500); 
  
  const searchMovies = useTierStore((state) => state.searchMovies);
  const isLoading = useTierStore((state) => state.isLoading);

  // Efek samping: Setiap kali debouncedQuery berubah, panggil API
  useEffect(() => {
    searchMovies(debouncedQuery);
  }, [debouncedQuery, searchMovies]);

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari film..."
          className="w-full p-4 pl-12 bg-slate-800 border border-slate-700 rounded-xl 
                     text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                     transition-all shadow-lg"
        />
        
        {/* Ikon di sebelah kiri */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {isLoading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
      </div>
    </div>
  );
}