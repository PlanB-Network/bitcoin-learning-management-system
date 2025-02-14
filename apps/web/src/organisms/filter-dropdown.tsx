import { useEffect, useRef, useState } from 'react';

import { IoMdClose } from 'react-icons/io';
import { MdOutlineClear } from 'react-icons/md';

import { TextTag, cn } from '@blms/ui';

import { t } from 'i18next';
import FilterIcon from '#src/assets/icons/Filter.svg';
import SearchIcon from '#src/assets/icons/search.svg';

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

  if (filters) {
    useEffect(() => {
      if (!activeCategory) {
        const firstCategory = Object.keys(filters)[0] || null;
        setActiveCategory(firstCategory);
      }
    }, [filters, activeCategory]);
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

  const selectCategory = (category: string) => {
    if (category !== activeCategory) {
      setActiveCategory(category);
    }
  };

  return (
    <section
      className="mx-auto max-w-2xl rounded-lg bg-tertiary-11"
      ref={dropdownRef}
    >
      <div className="relative">
        <div
          className={cn(
            'relative w-full flex items-center gap-2.5 border border-tertiary-10 overflow-x-scroll bg-tertiary-10 no-scrollbar',
            isFocused && 'border-darkOrange-7',
            isOpen ? 'rounded-b-0 rounded-t-lg' : 'rounded-lg',
            filters && 'pr-14',
          )}
        >
          <img src={SearchIcon} alt="search" className="absolute size-6 mx-2" />

          <input
            id="searchInput"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            placeholder={`${t('search.search')}...`}
            className={cn(
              'relative ps-10 px-2.5 py-2.5 peer w-full body-16px placeholder:body-16px !bg-transparent text-darkOrange-6 placeholder:text-tertiary-6 focus:ring-0 focus:outline-none',
            )}
            onFocus={() => {
              setIsFocused(true);
              if (isOpen) {
                setIsOpen(false);
              }
            }}
            onBlur={() => setIsFocused(false)}
          />

          <button
            type="button"
            onClick={() => {
              props.onClear?.();
              document.querySelector<HTMLInputElement>('#searchInput')?.focus();
            }}
            className={cn(
              'text-darkOrange-0 flex items-center shrink-0',
              !searchQuery && 'hidden',
            )}
          >
            <MdOutlineClear size={18} />
          </button>
        </div>

        {filters && (
          <button
            type="button"
            onClick={toggleDropdown}
            className={cn(
              'absolute text-darkOrange-0 inset-y-0 right-0 flex items-center rounded-tr-lg border border-l-0 border-darkOrange-6',
              isFocused
                ? 'bg-tertiary-8 border-darkOrange-7'
                : 'bg-darkOrange-6 ',
              isOpen ? 'rounded-br-0' : 'rounded-br-lg',
            )}
          >
            <span>
              <img className="p-2.5" src={FilterIcon} sizes="20" alt="" />
            </span>
          </button>
        )}
      </div>

      {filters && isOpen && (
        <div className="bg-tertiary-10 p-2.5 rounded-b-lg border-t border-tertiary-9">
          <div className="flex gap-1 mb-[15px]">
            {Object.keys(filters).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => selectCategory(category)}
                className={cn(
                  'px-2.5 py-1.5 body-16px',
                  category === activeCategory
                    ? 'text-white underline'
                    : 'text-newBlack-4 no-underline',
                )}
              >
                {t(`filters.${category.toLowerCase()}`)}
              </button>
            ))}
          </div>

          {activeCategory && (
            <div className="grid grid-cols-2 gap-x-7 gap-y-5">
              {filters[activeCategory].map((option) => (
                <div className="flex items-center" key={option.name}>
                  <label className="flex items-center cursor-pointer relative gap-[7px]">
                    <input
                      type="checkbox"
                      checked={
                        selectedFilters[activeCategory]?.has(option.name) ||
                        false
                      }
                      onChange={() =>
                        props.onChange?.(activeCategory, option.name)
                      }
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
                        role="img"
                        aria-label="Checked"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <span className="text-tertiary-2 body-14px capitalize shrink-0 max-[400px]:max-w-[90px] max-w-[150px] w-full">
                      {option.translation}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {selectedFilters &&
        Object.values(selectedFilters).some(
          (options) => options.size > 0 && !options.has('all'),
        ) && (
          <div className="flex flex-wrap items-center gap-[5px] px-2.5 py-2">
            {Object.entries(selectedFilters).map(([category, options]) =>
              [...options]
                .filter((option) => option !== 'all')
                .map((option) => (
                  <TextTag
                    key={`${category}-${option}`}
                    variant="lightMaroon"
                    mode="dark"
                    size="verySmall"
                    className="text-nowrap capitalize"
                  >
                    <span>
                      {
                        filters[category].find((opt) => opt.name === option)
                          ?.translation
                      }
                    </span>
                    <IoMdClose
                      className="text-tertiary-4 cursor-pointer"
                      size={16}
                      onClick={() => props.onChange?.(category, option)}
                    />
                  </TextTag>
                )),
            )}
          </div>
        )}
    </section>
  );
};
