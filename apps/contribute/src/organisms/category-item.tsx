import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import type React from 'react';

import { cn } from '@blms/ui';

import { CategoryIcon } from '#src/components/category-icon.tsx';
import {
  RESOURCES_CATEGORIES,
  TUTORIALS_CATEGORIES,
} from '#src/services/utils.tsx';

interface Category {
  name: string;
  image: string;
  unreleased?: boolean;
}

interface CategoryItemProps {
  category: Category;
  baseUrl: string;
  title: (category: Category) => string;
}

interface CategoryItemListProps {
  baseUrl: string;
  categoryType: 'resources' | 'tutorials';
  title: (category: Category) => string;
}

const itemStyles = cva(
  'flex flex-col justify-center items-center gap-3 transition-all bg-darkOrange-10 hover:bg-darkOrange-9 border border-darkOrange-9 hover:border-darkOrange-8 rounded-[15px]',
);

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  baseUrl,
  title,
}) => {
  return (
    <Link to={`${baseUrl}/${category.name}`} className={cn('group capitalize')}>
      <div className={cn(itemStyles(), 'size-[135px] flex-none')}>
        <CategoryIcon
          src={category.image}
          variant="resources"
          imgClassName={cn('')}
        />
        <span className={cn('body-16px text-white text-center')}>
          {title(category)}
        </span>
      </div>
    </Link>
  );
};

const CategoryItemList: React.FC<CategoryItemListProps> = ({
  baseUrl,
  categoryType,
  title,
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
            title={title}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryItemList;
