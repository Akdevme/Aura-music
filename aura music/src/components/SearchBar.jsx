import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, Music, User } from 'lucide-react';
import { getSuggestions } from '../services/auraMusicApi';

export const SearchBar = ({ onSearch, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced fetch suggestions - starts after 2 characters
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    setShowSuggestions(true);
    try {
      const result = await getSuggestions(searchQuery);
      setSuggestions(result.suggestions);
    } catch (error) {
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Handle input change with debounce - starts fetching after 2 chars
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    setHighlightedIndex(-1);

    // Show dropdown when typing (even before API response)
    if (value.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 200); // Faster debounce for smoother UX
  }, [fetchSuggestions]);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      handleSuggestionClick(suggestions[highlightedIndex]);
    } else if (query.trim()) {
      setShowSuggestions(false);
      onSearch(query.trim());
    }
  }, [query, highlightedIndex, suggestions, onSearch]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);
    onSearch(suggestion.name);
  }, [onSearch]);

  // Handle clear
  const handleClear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    onSearch('');
  }, [onSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        } else if (query.trim()) {
          setShowSuggestions(false);
          onSearch(query.trim());
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  }, [showSuggestions, suggestions, highlightedIndex, query, onSearch, handleSuggestionClick]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto group">
      <form
        ref={searchRef}
        onSubmit={handleSubmit}
        className="relative"
      >
        <div className="relative">

          {/* Search Icon with focus purple */}
          <Search
            className="
              absolute left-3 top-1/2 -translate-y-1/2
              text-gray-300 h-6 w-6 z-20 pointer-events-none
              transition-all duration-200
              group-focus-within:text-purple-400
            "
          />

          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            placeholder="Search for songs, artists, albums..."
            className="w-full pl-8 sm:pl-10 md:pl-12 lg:pl-14 pr-8 sm:pr-10 md:pr-12 lg:pr-14 py-2 sm:py-3 md:py-4 lg:py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg sm:rounded-xl lg:rounded-2xl text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 sm:focus:ring-4 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 text-xs sm:text-sm md:text-base lg:text-lg shadow-xl"
            disabled={isLoading}
          />


          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 sm:right-3 md:right-4 lg:right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-1 transition-all duration-200 z-20"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </button>
          )}
        </div>


        {isLoading && (
          <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center pointer-events-none">
            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 border-2 sm:border-3 border-purple-400 border-t-transparent"></div>
          </div>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query.length >= 2) && (
        <div
          ref={suggestionsRef}
          className="scrollbar-hidden-custom absolute top-full left-0 right-0 mt-2 bg-ssbg backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto"
        >
          {/* Loading indicator */}
          {isLoadingSuggestions && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-400 border-t-transparent"></div>
              <span className="ml-2 text-gray-400 text-sm">Searching...</span>
            </div>
          )}

          {/* No results */}
          {!isLoadingSuggestions && suggestions.length === 0 && (
            <div className="px-4 py-6 text-center text-gray-400">
              <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No suggestions found</p>
            </div>
          )}

          {/* Suggestions list */}
          {!isLoadingSuggestions && suggestions.length > 0 && (
            <ul className="py-2">
              {suggestions.map((suggestion, index) => (
                <li key={`${suggestion.type}-${suggestion.id}`}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`
                      w-full flex items-center px-4 py-3 transition-colors duration-150
                      ${index === highlightedIndex
                        ? 'bg-purple-600/40 text-white'
                        : 'text-gray-200 hover:bg-white/10'
                      }
                    `}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {suggestion.type === 'song' ? (
                      <Music className="h-5 w-5 mr-3 text-purple-400 flex-shrink-0" />
                    ) : (
                      <User className="h-5 w-5 mr-3 text-blue-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium truncate">{suggestion.name}</p>
                      <p className="text-xs text-gray-400 truncate">{suggestion.artist}</p>
                    </div>
                    <Search className="h-4 w-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Search hint */}
          {!isLoadingSuggestions && suggestions.length > 0 && (
            <div className="px-4 py-2 border-t border-white/10 text-xs text-gray-500 flex items-center justify-between">
              <span>Press Enter to search</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">↓</kbd>
                <span className="ml-1">to navigate</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
