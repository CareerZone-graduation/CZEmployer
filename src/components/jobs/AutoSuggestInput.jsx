import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Input with inline autocomplete suggestion
 * Shows suggestion in gray text, press Enter/Tab to accept
 */
const AutoSuggestInput = ({ 
  value, 
  onChange, 
  suggestions = [],
  placeholder,
  className,
  ...props 
}) => {
  const [suggestion, setSuggestion] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!value || typeof value !== 'string' || value.length < 2) {
      setSuggestion('');
      return;
    }

    // Find matching suggestion
    const match = suggestions.find(s => 
      s.toLowerCase().startsWith(value.toLowerCase()) && 
      s.toLowerCase() !== value.toLowerCase()
    );

    setSuggestion(match || '');
  }, [value, suggestions]);

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === 'Tab') && suggestion) {
      e.preventDefault();
      onChange({ target: { value: suggestion } });
      setSuggestion('');
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(className)}
        {...props}
      />
      {suggestion && (
        <div className="absolute inset-0 pointer-events-none flex items-center px-3">
          <span className="invisible">{value}</span>
          <span className="text-gray-400">
            {suggestion.slice(value.length)}
          </span>
        </div>
      )}
    </div>
  );
};

export default AutoSuggestInput;
