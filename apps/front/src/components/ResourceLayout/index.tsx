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
      <div className="bg-primary-900 w-full min-h-screen h-fit  p-[3em] space-y-10">
        <div className="">
          <PageTitle>{title}</PageTitle>
          {tagLine && (
            <p className="pb-3 mx-8 mt-2 font-thin text-justify text-white uppercase">
              {tagLine}
            </p>
          )}
        </div>

        {filterBar && (
          <div className="mt-16">
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
