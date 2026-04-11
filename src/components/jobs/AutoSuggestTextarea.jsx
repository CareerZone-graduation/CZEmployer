import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

/**
 * Textarea with inline autocomplete suggestion
 * Shows suggestion in gray text overlay, press Tab to accept
 */
const AutoSuggestTextarea = ({ 
  value, 
  onChange, 
  suggestions = [],
  placeholder,
  className,
  minTriggerLength = 2,
  ...props 
}) => {
  const [suggestion, setSuggestion] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!value || typeof value !== 'string' || value.length < minTriggerLength) {
      setSuggestion('');
      setShowSuggestion(false);
      return;
    }

    // Find matching suggestion based on keywords
    const lowerValue = value.toLowerCase().trim();
    
    // Check if current value matches start of any suggestion
    const match = suggestions.find(s => {
      const suggestionStart = s.toLowerCase().substring(0, lowerValue.length);
      return suggestionStart === lowerValue;
    });

    if (match && match.toLowerCase() !== lowerValue) {
      setSuggestion(match);
      setShowSuggestion(true);
    } else {
      setSuggestion('');
      setShowSuggestion(false);
    }
  }, [value, suggestions, minTriggerLength]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && showSuggestion && suggestion) {
      e.preventDefault();
      onChange({ target: { value: suggestion } });
      setSuggestion('');
      setShowSuggestion(false);
    }
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(className)}
        {...props}
      />
      {showSuggestion && suggestion && (
        <div className="absolute inset-0 pointer-events-none p-3 overflow-hidden">
          <div className="whitespace-pre-wrap break-words">
            <span className="invisible">{value}</span>
            <span className="text-gray-400 bg-gray-50/50">
              {suggestion.slice(value.length)}
            </span>
          </div>
        </div>
      )}
      {showSuggestion && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded border border-gray-200 pointer-events-none">
          Nhấn Tab để chấp nhận
        </div>
      )}
    </div>
  );
};

export default AutoSuggestTextarea;
