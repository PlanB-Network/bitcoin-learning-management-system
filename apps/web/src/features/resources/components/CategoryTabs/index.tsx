import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { capitalizeFirstWord } from '../../../../utils/string.ts';
import { RESOURCES_CATEGORIES } from '../../utils.tsx';

interface CategoryTabsProps {
  resourceCategoryActive?: string;
}

export const CategoryTabs = ({ resourceCategoryActive }: CategoryTabsProps) => {
  const { t } = useTranslation();

  return (
    <nav className="md:flex flex-wrap w-full justify-center items-center md:gap-10 md:px-5 md:mb-10 hidden">
      {RESOURCES_CATEGORIES.map((resourceCategory) => (
        <Link
          key={resourceCategory.name}
          to={`/resources/${resourceCategory.name}`}
          onClick={(event) =>
            resourceCategory.unreleased && event.preventDefault()
          }
          className={
            resourceCategory.unreleased
              ? 'cursor-not-allowed opacity-50'
              : resourceCategory.name === resourceCategoryActive
                ? 'scale-125 filter-newOrange1'
                : ''
          }
        >
          <div className="group flex justify-center items-center p-4 border border-white rounded-xl max-md:hover:scale-125">
            <img
              src={resourceCategory.image}
              alt={resourceCategory.name}
              className="filter-white max-w-9 max-md:group-hover:filter-newOrange1"
            />
            <span className="text-white opacity-0 font-medium leading-[1.43] tracking-[0.17px] max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden group-hover:max-w-96 group-hover:opacity-100 group-hover:ml-4 ease-in-out duration-500">
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
