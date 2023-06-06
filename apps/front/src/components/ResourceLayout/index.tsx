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
  pagination?: boolean;
  className?: string;
}

export const ResourceLayout = ({
  title,
  tagLine,
  children,
  filterBar,
  pagination,
  className,
}: Props) => {
  return (
    <MainLayout footerVariant="dark">
      <div
        className={`bg-primary-900 flex h-fit min-h-screen justify-center p-2 sm:p-10 ${className}`}
      >
        <div className="max-w-6xl">
          <div>
            <PageTitle>{title}</PageTitle>
            {tagLine && (
              <p className="mx-4 mt-2 pb-3 text-justify text-sm font-thin uppercase text-white sm:mx-8 sm:text-base">
                {tagLine}
              </p>
            )}
          </div>

          {filterBar && (
            <div className="my-3 sm:my-6 md:my-8">
              <FilterBar {...filterBar} />
            </div>
          )}

          <div className="my-6 sm:my-12 md:my-16">{children}</div>

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
