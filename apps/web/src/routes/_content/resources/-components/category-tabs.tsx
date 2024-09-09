import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { cn } from '@blms/ui';

import { RESOURCES_CATEGORIES } from '#src/services/utils.js';
import { capitalizeFirstWord } from '#src/utils/string.js';

interface CategoryTabsProps {
  resourceActiveCategory?: string;
}

export const CategoryTabs = ({ resourceActiveCategory }: CategoryTabsProps) => {
  const { t } = useTranslation();

  return (
    <nav className="md:flex flex-wrap w-full justify-center items-center md:gap-6 lg:gap-8 xl:gap-10 md:px-5 mb-10 hidden">
      {RESOURCES_CATEGORIES.map((resourceCategory) => (
        <Link
          key={resourceCategory.name}
          to={`/resources/${resourceCategory.name}`}
          onClick={(event) =>
            resourceCategory.unreleased && event.preventDefault()
          }
          className={cn(
            'group',
            resourceCategory.unreleased
              ? 'cursor-not-allowed opacity-50'
              : resourceCategory.name === resourceActiveCategory
                ? 'scale-125 filter-newOrange1'
                : '',
          )}
        >
          <div className="flex justify-center items-center p-2 lg:p-4 border border-white rounded-xl">
            <img
              src={resourceCategory.image}
              alt={resourceCategory.name}
              className="filter-white max-w-7 lg:max-w-9"
            />
            <span
              className={cn(
                'text-white opacity-0 max-lg:text-sm font-medium leading-[1.43] tracking-[0.17px] max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-700',
                resourceCategory.name !== resourceActiveCategory &&
                  'group-hover:max-w-96 group-hover:opacity-100 group-hover:ml-3 lg:group-hover:ml-4 group-focus:max-w-96 group-focus:opacity-100 group-focus:ml-3 lg:group-focus:ml-4',
              )}
            >
              {capitalizeFirstWord(
                t(`resources.${resourceCategory.name}.title`),
              )}
            </span>
          </div>
        </Link>
      ))}
    </nav>
  );
};
