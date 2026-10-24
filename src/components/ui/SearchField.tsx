import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = ''
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="w-3.5 h-3.5 text-[#9A9C94] absolute left-3 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#FFFFFF] border border-[#E5E4DC] rounded-md text-[#20211D] placeholder:text-[#9A9C94] focus:outline-none focus:border-[#536B4F] focus:ring-1 focus:ring-[#536B4F] transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 text-[#9A9C94] hover:text-[#20211D] p-0.5 rounded-sm"
          aria-label="Clear search"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
