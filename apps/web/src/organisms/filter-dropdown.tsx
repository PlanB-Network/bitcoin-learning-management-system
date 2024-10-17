import { useEffect, useRef, useState } from 'react';

import FilterIcon from '../../../../apps/web/src/assets/icons/Filter.svg';
import SearchIcon from '../../../../apps/web/src/assets/icons/search.svg';

interface FilterDropdownProps {
  filters: Record<string, string[]>;
  selectedFilters: Record<string, string[]>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onChange: (category: string, option: string) => void;
}

export const FilterDropdown = ({
  filters,
  selectedFilters,
  searchQuery,
  setSearchQuery,
  onChange,
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeCategory) {
      const firstCategory = Object.keys(filters)[0] || null;
      setActiveCategory(firstCategory);
    }
  }, [filters, activeCategory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (dropdownRef.current && isOpen) {
        const dropdownBottom =
          dropdownRef.current.getBoundingClientRect().bottom;
        const viewportHeight = window.innerHeight;

        if (dropdownBottom < 0 || dropdownBottom > viewportHeight) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScroll);
    } else {
      window.removeEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const selectCategory = (category: string) => {
    if (category !== activeCategory) {
      setActiveCategory(category);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <section className="max-w-72 mx-auto" ref={dropdownRef}>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[10px]">
          <img src={SearchIcon} sizes="20" alt="" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className={`block w-full pl-9 py-[10px] body-16px placeholder:body-16px bg-tertiary-10 text-darkOrange-6 placeholder:text-tertiary-6 rounded-[10px] focus:outline-none focus:border focus:border-darkOrange-7 focus:ring-0 ${
            isOpen ? 'rounded-b-0' : 'rounded-b-[10px]'
          }`}
          style={{
            borderBottomLeftRadius: isOpen ? '0' : '10px',
            borderBottomRightRadius: isOpen ? '0' : '10px',
          }}
          onFocus={() => {
            setIsFocused(true);
            if (isOpen) {
              setIsOpen(false);
            }
          }}
          onBlur={() => setIsFocused(false)}
        />

        <button
          className={`absolute text-darkOrange-0 inset-y-0 right-0 flex items-center rounded-tr-[10px]
            ${isFocused ? 'bg-tertiary-8 border-y border-r border-darkOrange-7' : 'bg-darkOrange-6'}
            ${isOpen ? 'rounded-br-0 border-b-0' : 'rounded-br-[10px]'}
            border-l-0
          `}
          onClick={toggleDropdown}
        >
          <span>
            <img className="p-[10px]" src={FilterIcon} sizes="20" alt="" />
          </span>
        </button>

        <button
          className="absolute text-darkOrange-0 inset-y-0 right-14 flex items-center"
          onClick={clearSearch}
        >
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-[18px]"
              viewBox="0 0 20 20"
              fill="#E3DDD9"
            >
              <path
                fillRule="evenodd"
                d="M10 9.293l4.95-4.95a1 1 0 011.415 1.415L11.414 10l4.95 4.95a1 1 0 01-1.415 1.415L10 11.414l-4.95 4.95a1 1 0 01-1.415-1.415L8.586 10 3.636 5.05A1 1 0 015.05 3.636L10 8.586z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="bg-tertiary-10 p-[10px] rounded-b-[10px] border-t border-tertiary-9">
          <div className="flex gap-1 mb-[15px]">
            {Object.keys(filters).map((category) => (
              <button
                key={category}
                onClick={() => selectCategory(category)}
                className={`px-[10px] py-1.5 body-16px ${
                  category === activeCategory
                    ? 'text-white underline'
                    : 'text-newBlack-4 no-underline'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {activeCategory && (
            <div className="grid grid-cols-2 gap-x-7 gap-y-5">
              {filters[activeCategory].map((option) => (
                <div className="flex items-center" key={option}>
                  <label className="flex items-center cursor-pointer relative gap-[7px]">
                    <input
                      type="checkbox"
                      checked={
                        selectedFilters[activeCategory]?.includes(option) ||
                        false
                      }
                      onChange={() => onChange(activeCategory, option)}
                      className="peer size-5 shrink-0 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border-2 border-gray-200 checked:bg-transparent checked:border-gray-200"
                      id={`check-${option}`}
                    />
                    <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 ml-0.5 -translate-y-1/2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-3.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </span>
                    <span className="text-tertiary-2 body-14px capitalize shrink-0 max-w-[150px] w-full">
                      {option}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
