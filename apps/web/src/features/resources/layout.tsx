import { Link } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { MainLayout } from '../../components/MainLayout';

import { FilterBar } from './components/FilterBar';
import { PageTitle } from './components/PageTitle';
import { Pagination } from './components/Pagination';

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
  link?: string;
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
        className={`flex h-fit min-h-screen justify-center bg-blue-900 p-2 sm:p-10 ${className}`}
      >
        <div className="max-w-6xl">
          <div>
            {link ? (
              <Link to={link}>
                <PageTitle>{title}</PageTitle>
              </Link>
            ) : (
              <PageTitle>{title}</PageTitle>
            )}
            {tagLine && (
              <p className="mx-4 mt-2 pb-3 text-justify text-sm font-light uppercase text-white sm:mx-8 sm:text-base">
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
