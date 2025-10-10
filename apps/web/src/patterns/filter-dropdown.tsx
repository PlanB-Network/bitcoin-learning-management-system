import { cn } from '@blms/ui';
import { t } from 'i18next';
import { useEffect, useRef, useState } from 'react';
import {
  TbAdjustmentsHorizontal,
  TbCheck,
  TbSearch,
  TbX,
} from 'react-icons/tb';

interface FilterDropdownProps {
  filters?: null;
  selectedFilters?: null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onChange?: (category: string, option: string) => void;
  onClear?: () => void;
}

interface FilterDropdownPropsWithFilters
  extends Omit<FilterDropdownProps, 'filters' | 'selectedFilters'> {
  filters: Record<string, { name: string; translation: string }[]>;
  selectedFilters: Record<string, Set<string>>;
}

export const FilterDropdown = ({
  filters,
  selectedFilters,
  searchQuery,
  setSearchQuery,
  ...props
}: FilterDropdownProps | FilterDropdownPropsWithFilters) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterKeys = Object.keys(filters || {});

  if (filters) {
    // biome-ignore lint/correctness/useHookAtTopLevel: TODO check
    useEffect(() => {
      if (!activeCategory) {
        const firstCategory = filterKeys[0] || null;
        setActiveCategory(firstCategory);
      }
    }, [filterKeys, activeCategory]);
  }

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

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  console.log({ filters, filterKeys });
  return (
    <section className="w-full" ref={dropdownRef}>
      <div className="relative">
        <div
          className={cn(
            'relative w-full flex items-center gap-2.5 border border-transparent overflow-x-scroll bg-neutral-50 no-scrollbar',
            isFocused ? 'md:border-orange-500' : 'hover:border-neutral-100',
            isOpen ? 'max-md:rounded-b-none rounded-xl' : 'rounded-xl',
            filters && 'pr-12 md:pr-0',
          )}
        >
          <input
            ref={searchInputRef}
            id="searchInput"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            placeholder={`${t('search.search')}...`}
            className={cn(
              'relative p-3 peer w-full body-base placeholder:body-base !bg-transparent text-black placeholder:text-neutral-400 focus:ring-0 focus:outline-hidden',
            )}
            onFocus={() => {
              setIsFocused(true);
              if (isOpen) {
                setIsOpen(false);
              }
            }}
            onBlur={() => setIsFocused(false)}
          />

          <TbSearch
            className={cn(
              'shrink-0 mr-3 text-neutral-400',
              searchQuery && 'hidden',
            )}
            size={24}
          />

          <button
            type="button"
            onClick={() => {
              props.onClear?.();
              document.querySelector<HTMLInputElement>('#searchInput')?.focus();
            }}
            className={cn(
              'shrink-0 bg-neutral-100 text-neutral-400 hover:bg-orange-500 hover:text-white rounded-full p-1 mr-3',
              !searchQuery && 'hidden',
            )}
          >
            <TbX size={16} />
          </button>
        </div>

        {filters && (
          <button
            type="button"
            onClick={toggleDropdown}
            className={cn(
              'absolute md:hidden text-neutral-400 inset-y-0 right-0 flex items-center bg-neutral-100 px-4',
              isOpen ? 'max-md:rounded-br-none rounded-r-xl' : 'rounded-r-xl',
            )}
          >
            <TbAdjustmentsHorizontal size={16} />
          </button>
        )}
      </div>

      {filters && isOpen && (
        <div className="px-5 py-3 rounded-b-xl border border-neutral-100 md:hidden">
          {activeCategory && (
            <div className="grid grid-cols-2 gap-4">
              {filters[activeCategory].map((option) => (
                <div className="flex items-center" key={option.name}>
                  <label className="flex items-center cursor-pointer relative gap-2">
                    <input
                      type="checkbox"
                      checked={
                        selectedFilters[activeCategory]?.has(option.name) ||
                        false
                      }
                      onChange={() =>
                        props.onChange?.(activeCategory, option.name)
                      }
                      className="peer size-3 shrink-0 cursor-pointer transition-all appearance-none border-1 rounded-xs border-neutral-800 checked:bg-transparent checked:border-orange-500"
                      id={`check-${option}`}
                    />
                    <span className="absolute text-orange-500 opacity-0 peer-checked:opacity-100 top-1/2 ml-0.5 -translate-y-1/2">
                      <TbCheck size={8} />
                    </span>
                    <span className="text-neutral-800 peer-checked:text-orange-500 body-small shrink-0 w-full">
                      {option.translation}
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
