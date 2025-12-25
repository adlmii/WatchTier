import { useEffect, useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { useTierStore } from '../../store/useTierStore';
import { useDebounce } from '../../hooks/useDebounce';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 500); 
  
  const searchMovies = useTierStore((state) => state.searchMovies);
  const isLoading = useTierStore((state) => state.isLoading);

  useEffect(() => {
    searchMovies(debouncedQuery);
  }, [debouncedQuery, searchMovies]);

  return (
    <div className="w-full max-w-2xl mx-auto mb-10 relative z-20">
      <div 
        className={`relative group transition-all duration-300 ${
          isFocused ? 'scale-105' : 'scale-100'
        }`}
      >
        {/* Glow Effect di belakang */}
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30 transition duration-500 group-hover:opacity-60 ${isFocused ? 'opacity-70' : ''}`} />
        
        <div className="relative flex items-center bg-[#151923] rounded-2xl border border-white/10 shadow-2xl">
          <div className="pl-6 text-slate-400">
            {isLoading ? (
              <Loader2 className="animate-spin w-5 h-5 text-blue-400" />
            ) : (
              <Search className={`w-5 h-5 transition-colors ${isFocused ? 'text-blue-400' : ''}`} />
            )}
          </div>

          <input
            type="text"
            value={query}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies (e.g. Avengers, Joker)..."
            className="w-full p-5 bg-transparent text-lg text-white placeholder-slate-500 focus:outline-none font-medium"
          />
          
          <div className="pr-6">
            <Sparkles className="w-5 h-5 text-slate-600 group-hover:text-yellow-400 transition-colors duration-500" />
          </div>
        </div>
      </div>
    </div>
  );
}