import { ReactNode } from 'react';
import { FilterBar, MainLayout, Pagination } from '../../components';
import { PageTitle } from '../../components/PageTitle';

interface Props {
  title: string;
  tagLine: string;
  children: ReactNode;
  filterBar?: {
    label?: string;
    value?: string;
    onChange: (v: string) => void;
  };
}

export const RessourceLayout = ({
  title,
  tagLine,
  children,
  filterBar,
}: Props) => {
  return (
    <MainLayout>
      <div className="bg-primary-900 w-full min-h-screen h-fit  p-[3em] space-y-10">
        <div className="">
          <PageTitle>{title}</PageTitle>
          <p className="pb-3 mx-8 text-justify text-white">{tagLine}</p>
        </div>

        {filterBar && (
          <div className="mt-16">
            <FilterBar {...filterBar} />
          </div>
        )}

        <div>{children}</div>

        <div className="mx-auto w-max">
          <Pagination />
        </div>
      </div>
    </MainLayout>
  );
};
