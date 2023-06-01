import { ReactNode } from 'react';

import { FilterBar, MainLayout, Pagination } from '..';
import { PageTitle } from '../PageTitle';

interface Props {
  title: string;
  tagLine?: string;
  children: ReactNode;
  filterBar?: {
    label?: string;
    value?: string;
    onChange: (v: string) => void;
  };
  pagination?: {};
}

export const ResourceLayout = ({
  title,
  tagLine,
  children,
  filterBar,
  pagination,
}: Props) => {
  return (
    <MainLayout>
      <div className="p-2 w-full min-h-screen sm:p-10 bg-primary-900 h-fit">
        <div>
          <PageTitle>{title}</PageTitle>
          {tagLine && (
            <p className="pb-3 mx-4 mt-2 text-sm font-thin text-justify text-white uppercase sm:text-base sm:mx-8">
              {tagLine}
            </p>
          )}
        </div>

        {filterBar && (
          <div className="mt-6 sm:mt-12 md:mt-16">
            <FilterBar {...filterBar} />
          </div>
        )}

        <div>{children}</div>

        {pagination && (
          <div className="mx-auto w-max">
            <Pagination />
          </div>
        )}
      </div>
    </MainLayout>
  );
};
