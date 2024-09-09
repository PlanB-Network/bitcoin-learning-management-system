import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { cn } from '@blms/ui';

import { CategoryIcon } from '#src/components/category-icon.js';
import { RESOURCES_CATEGORIES } from '#src/services/utils.js';
import { capitalizeFirstWord } from '#src/utils/string.js';

import { ResourcesDropdownItem } from './resources-category-dropdown-item.tsx';

interface ResourcesDropdownMenuProps {
  resourceActiveCategory?: string;
  backToCategoryButton?: boolean;
}

export const ResourcesDropdownMenu = ({
  resourceActiveCategory,
  backToCategoryButton,
}: ResourcesDropdownMenuProps) => {
  const { t } = useTranslation();
  const filteredResourcesCategories = RESOURCES_CATEGORIES.filter(
    (category) => category.name !== resourceActiveCategory,
  );
  const activeCategoryImageSrc = RESOURCES_CATEGORIES.find(
    (category) => category.name === resourceActiveCategory,
  )?.image;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDropdown = () => setIsOpen(!isOpen);
  const ref = useRef<HTMLDivElement>(null);

  // Close the dropdown if the click is outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  if (backToCategoryButton) {
    return (
      <div className={'w-fit max-w-[280px] mx-auto mb-6 md:hidden'}>
        <Link to={`/resources/${resourceActiveCategory}`}>
          <button
            type="button"
            className={cn(
              'flex items-center gap-2 p-2 pr-3 w-full bg-darkOrange-11 rounded-xl border border-darkOrange-9',
            )}
          >
            <CategoryIcon
              src={activeCategoryImageSrc || ''}
              variant="resources"
              imgClassName="filter-darkOrange size-6"
            />
            <span className="text-darkOrange-5 font-medium leading-[140%] tracking-015px">
              {capitalizeFirstWord(
                t(`resources.${resourceActiveCategory}.title`),
              )}
            </span>
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={'relative w-full max-w-[280px] mx-auto mb-6 md:hidden'}
      ref={ref}
    >
      <div>
        <button
          type="button"
          className={cn(
            'flex items-center gap-4 p-2 w-full bg-darkOrange-11',
            isOpen
              ? 'rounded-t-xl border-x border-t border-darkOrange-9'
              : 'rounded-xl border border-darkOrange-9',
          )}
          id="options-menu"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={toggleDropdown}
        >
          <CategoryIcon
            src={activeCategoryImageSrc || ''}
            variant="resources"
            imgClassName="filter-newOrange1 size-6"
          />
          <span className="text-darkOrange-5 font-medium leading-[140%] tracking-015px">
            {capitalizeFirstWord(
              t(`resources.${resourceActiveCategory}.title`),
            )}
          </span>
          <MdKeyboardArrowDown
            className={cn(
              'ml-auto text-newOrange-1 size-6 transition-transform ease-in-out',
              isOpen ? '-rotate-180' : 'rotate-0',
            )}
          />
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute left-1/2 -translate-x-1/2 w-full max-w-[280px] rounded-b-xl bg-darkOrange-11 border-x border-b border-darkOrange-9 z-10 overflow-hidden"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          {filteredResourcesCategories.map(
            (category) =>
              !category.unreleased && (
                <ResourcesDropdownItem
                  name={category.name}
                  imageSrc={category.image}
                  key={category.name}
                />
              ),
          )}
        </div>
      )}
    </div>
  );
};
