import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import type React from 'react';

import { cn } from '@blms/ui';

import { CategoryIcon } from '#src/components/category-icon.tsx';
import { RESOURCES_CATEGORIES } from '#src/services/utils.tsx';
import { TUTORIALS_CATEGORIES } from '#src/utils/tutorials.ts';

interface Category {
  name: string;
  image: string;
  unreleased?: boolean;
}

interface CategoryItemProps {
  category: Category;
  baseUrl: string;
}

interface CategoryItemListProps {
  baseUrl: string;
  categoryType: 'resources' | 'tutorials';
}

const itemStyles = cva(
  'flex flex-col w-[135px] p-5 justify-center items-center gap-3 transition-all bg-darkOrange-10 rounded-[15px]',
  {
    variants: {
      unreleased: {
        true: 'opacity-50 cursor-not-allowed',
        false: 'opacity-100',
      },
    },
    defaultVariants: {
      unreleased: false,
    },
  },
);

const CategoryItem: React.FC<CategoryItemProps> = ({ category, baseUrl }) => {
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
          imgClassName={cn('')}
        />
        <h3 className={cn('body-16px lg:text-xl text-white text-center')}>
          {category.name}
        </h3>
      </div>
    </Link>
  );
};

const CategoryItemList: React.FC<CategoryItemListProps> = ({
  baseUrl,
  categoryType,
}) => {
  const categories: readonly Category[] =
    categoryType === 'tutorials' ? TUTORIALS_CATEGORIES : RESOURCES_CATEGORIES;

  return (
    <div className="mt-10">
      <div className="flex flex-wrap justify-center items-center content-center gap-[15px] lg:gap-x-[25px] lg:gap-y-[40px] max-w-[1095px]">
        {categories.map((category) => (
          <CategoryItem
            key={category.name}
            category={category}
            baseUrl={baseUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryItemList;
