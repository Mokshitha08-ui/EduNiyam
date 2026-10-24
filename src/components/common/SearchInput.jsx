import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search by ID, institution, keyword...',
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'py-1.5 pl-8 pr-7 text-xs',
    md: 'py-2 pl-9 pr-8 text-sm',
    lg: 'py-2.5 pl-10 pr-9 text-base'
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5 left-2.5',
    md: 'w-4 h-4 left-3',
    lg: 'w-4.5 h-4.5 left-3.5'
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className={`absolute text-slate-400 pointer-events-none ${iconSizes[size]}`} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-slate-300 bg-white placeholder-slate-400 text-slate-800 focus:border-gov-600 focus:outline-none focus:ring-1 focus:ring-gov-600 shadow-subtle ${sizeClasses[size]}`}
      />
      {value && (
        <button
          type="button"
          onClick={() => (onClear ? onClear() : onChange(''))}
          className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
