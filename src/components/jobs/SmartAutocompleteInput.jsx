import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as jobService from '@/services/jobService';

/**
 * Smart autocomplete input with database-driven suggestions
 * Shows dropdown with matching job titles from database
 */
const SmartAutocompleteInput = ({ 
  value, 
  onChange, 
  placeholder,
  className,
  ...props 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch suggestions when user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!value || value.length < 1) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      console.log('Fetching suggestions for:', value);
      setIsLoading(true);
      try {
        const results = await jobService.searchJobTitles(value, 10);
        console.log('Suggestions received:', results);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        console.error('Error details:', error.response);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [value]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const selectSuggestion = (suggestion) => {
    onChange({ target: { value: suggestion } });
    setShowDropdown(false);
    setSelectedIndex(-1);
    setSuggestions([]); // Clear suggestions after selection
  };

  const handleBlur = (e) => {
    // Use setTimeout to allow click events on dropdown to fire first
    setTimeout(() => {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }, 200);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowDropdown(true);
          }
        }}
        placeholder={placeholder}
        className={cn(className)}
        autoComplete="off"
        {...props}
      />
      
      {showDropdown && suggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[300px] overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-200"
        >
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-2 text-xs font-medium text-gray-600">
              <Search className="h-3.5 w-3.5" />
              <span>Gợi ý từ database</span>
            </div>
          </div>
          
          <div className="max-h-[250px] overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={cn(
                  "px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0",
                  "hover:bg-blue-50 flex items-center gap-3",
                  selectedIndex === index && "bg-blue-100"
                )}
                onClick={() => selectSuggestion(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900 truncate">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default SmartAutocompleteInput;

