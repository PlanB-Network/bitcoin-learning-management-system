import type { RegisteredRouter, ToPathOption } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { MainLayout } from '../../components/MainLayout/index.tsx';

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
}

export const ResourceLayout = ({
  title,
  tagLine,
  children,
  filterBar,
  pagination,
  className,
  link,
}: Props) => {
  return (
    <MainLayout footerVariant="dark">
      <div
        className={`flex h-fit min-h-screen justify-center p-2 sm:p-10 ${className}`}
      >
        <div className="max-w-6xl text-black">
          <div>
            {link ? (
              <Link to={link} params={{}}>
                <PageTitle>{title}</PageTitle>
              </Link>
            ) : (
              <PageTitle>{title}</PageTitle>
            )}
            {tagLine && (
              <p className="mx-4 pb-3 pt-4 text-justify text-sm font-light uppercase text-white sm:mx-8 sm:pt-2 sm:text-base">
                {tagLine}
              </p>
            )}
          </div>

          {filterBar && (
            <div className="my-3 sm:my-6 md:my-8">
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
