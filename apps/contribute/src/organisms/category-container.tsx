import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import type React from 'react';

import { cn } from '@blms/ui';

import { CategoryIcon } from '#src/components/category-icon.tsx';

interface Category {
  name: string;
  image: string;
  unreleased?: boolean;
}

interface CategoryContainerProps {
  categories: Category[];
  baseUrl: string;
  getTitle: (category: Category) => string;
  bgClass?: string;
}

const CategoryContainer: React.FC<CategoryContainerProps> = ({
  categories,
  baseUrl,
  getTitle,
  bgClass = 'md:bg-[#1A1A1A40] md:shadow-[0px_5px_30px_0px_rgba(255,255,255,0.49)] md:rounded-3xl md:border border-white',
}) => {
  return (
    <div className="mt-10 md:mt-20 px-4 md:px-8">
      <div
        className={cn(
          'flex flex-wrap justify-center items-center content-center max-w-xl md:max-w-5xl md:p-[30px] mx-auto gap-4 sm:gap-5 md:gap-12',
          bgClass,
        )}
      >
        {categories.map((category) => (
          <CategoryItem
            key={category.name}
            category={category}
            baseUrl={baseUrl}
            getTitle={getTitle}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryContainer;

interface CategoryItemProps {
  category: Category;
  baseUrl: string;
  getTitle: (category: Category) => string;
}

const itemStyles = cva(
  'max-md:size-[135px] md:w-[272px] flex max-md:flex-col max-md:justify-center items-center rounded-2xl p-5 md:py-2.5 md:px-5 gap-3 md:gap-6 transition-all max-md:bg-newBlack-2 max-md:border max-md:border-newGray-1',
  {
    variants: {
      unreleased: {
        true: 'opacity-50 cursor-not-allowed',
        false:
          'opacity-100 md:group-hover:bg-newBlack-3 max-md:group-hover:border-darkOrange-5',
      },
    },
    defaultVariants: {
      unreleased: false,
    },
  },
);

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  baseUrl,
  getTitle,
}) => {
  return (
    <Link
      to={`${baseUrl}/${category.name}`}
      onClick={(event: React.MouseEvent<HTMLAnchorElement>) =>
        category.unreleased && event.preventDefault()
      }
      className={cn('group', category.unreleased ? 'cursor-not-allowed' : '')}
    >
      <div className={itemStyles({ unreleased: category.unreleased })}>
        <CategoryIcon
          src={category.image}
          variant="resources"
          imgClassName={cn(
            'max-md:filter-white',
            category.unreleased ? '' : 'max-md:group-hover:filter-newOrange1',
          )}
        />
        <h3
          className={cn(
            'max-md:desktop-body1 md:text-2xl text-white max-md:text-center',
            category.unreleased
              ? ''
              : 'max-md:group-hover:text-darkOrange-5 group-hover:font-medium',
          )}
        >
          {getTitle(category)}
        </h3>
      </div>
    </Link>
  );
};
