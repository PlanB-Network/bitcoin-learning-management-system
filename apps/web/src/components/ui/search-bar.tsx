import type { ChangeEvent, FC } from 'react';
import FilterIcon from '#src/assets/icons/Filter.svg';
import CrossIcon from '#src/assets/translation/cross.svg';
import SearchIcon from '#src/assets/translation/search.svg';

interface SearchBarProps {
  /** Current search value */
  value: string;
  /** Callback whenever the input changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Optional callback when the clear (X) button is pressed */
  onClear?: () => void;
  /** Optional callback when the filter button is clicked */
  onFilterClick?: () => void;
  /** Extra class names applied to the root element */
  className?: string;
}

/**
 * A reusable search bar with a search icon on the left, a clear (X) button, and
 * a brown-background filter button on the right.
 */
export const SearchBar: FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder,
  onClear,
  onFilterClick,
  className = '',
}) => {
  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div
      className={`flex items-center rounded-xl bg-[#E5E5E5] overflow-hidden focus-within:ring-2 focus-within:ring-newOrange-1 w-full ${className}`}
    >
      {/* Left search icon */}
      <span className="pl-3 mr-3 flex items-center">
        <img src={SearchIcon} alt="Search" className="w-4 h-4" />
      </span>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={handleInput}
        placeholder={placeholder}
        className="flex-1 py-2 px-2 text-sm outline-none bg-[#E5E5E5] placeholder-gray-500"
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="px-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <img src={CrossIcon} alt="Clear" className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Filter button */}
      <button
        type="button"
        onClick={onFilterClick}
        aria-label="Filter options"
        className="bg-maroon-8 hover:bg-maroon-9 flex items-center justify-center px-3 self-stretch"
      >
        <img src={FilterIcon} alt="Filter" className="w-5 h-5" />
      </button>
    </div>
  );
};
