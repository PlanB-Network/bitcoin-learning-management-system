import type { RegisteredRouter, ToPathOption } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { MainLayout } from '../../components/MainLayout/index.tsx';

import { CategoryTabs } from './components/CategoryTabs/index.tsx';
import { ResourcesDropdown } from './components/DropdownMenu/dropdown-menu.tsx';
import { FilterBar } from './components/FilterBar/index.tsx';
import { PageTitle } from './components/PageTitle/index.tsx';
import { Pagination } from './components/Pagination/index.tsx';

interface Props {
  title: string;
  tagLine?: string;
  children: ReactNode;
  filterBar?: {
    label?: string;
    value?: string;
    onChange: (v: string) => void;
  };
  pagination?: boolean;
  className?: string;
  link?: ToPathOption<RegisteredRouter['routeTree']>;
  categoryActive?: string;
}

export const ResourceLayout = ({
  title,
  tagLine,
  children,
  filterBar,
  pagination,
  className,
  link,
  categoryActive,
}: Props) => {
  return (
    <MainLayout footerVariant="dark">
      <div className={`flex h-fit justify-center p-2 md:p-10 ${className}`}>
        <div className="w-full max-w-6xl text-black">
          <CategoryTabs resourceCategoryActive={categoryActive} />
          <ResourcesDropdown resourceCategoryActive={categoryActive} />
          <div className="flex flex-col gap-1 text-center max-w-[880px] mx-auto">
            {link ? (
              // TODO fix
              <Link to={link as '/'}>
                <PageTitle>{title}</PageTitle>
              </Link>
            ) : (
              <PageTitle>{title}</PageTitle>
            )}
            {tagLine && (
              <p className="text-xs text-newGray-1 tracking-[0.15px] md:leading-[1.75] md:text-base">
                {tagLine}
              </p>
            )}
            C
          </div>

          {filterBar && (
            <div className="flex justify-center my-3 sm:my-6 md:my-8">
              <FilterBar {...filterBar} />
            </div>
          )}

          <div className="my-4 sm:my-6">{children}</div>

          {pagination && (
            <div className="mx-auto w-max">
              <Pagination />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
