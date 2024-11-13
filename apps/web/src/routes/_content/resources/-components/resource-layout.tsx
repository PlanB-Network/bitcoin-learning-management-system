import type { ToPathOption } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { cn } from '@blms/ui';

import { MainLayout } from '#src/components/main-layout.js';
import { PageHeader } from '#src/components/page-header.js';

import { CategoryTabs } from './category-tabs.tsx';
import { ResourcesDropdownMenu } from './dropdown-menu/resources-category-dropdown-menu.tsx';
import { FilterBar } from './filter-bar.tsx';

interface Props {
  title: string;
  tagLine?: string;
  children: ReactNode;
  filterBar?: {
    label?: string;
    value?: string;
    onChange: (v: string) => void;
  };
  className?: string;
  // TODO fix this build issue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  link?: ToPathOption<any>;
  // link?: ToPathOption<RegisteredRouter['routeTree']>;
  showPageHeader?: boolean;
  hidePageHeaderMobile?: boolean;
  addCredits?: boolean;
  backToCategoryButton?: boolean;
  activeCategory?: string;
  maxWidth?: '1152' | '1360';
  marginTopChildren?: boolean;
  showResourcesDropdownMenu?: boolean;
}

export const ResourceLayout = ({
  title,
  tagLine,
  children,
  filterBar,
  className,
  link,
  showPageHeader = true,
  hidePageHeaderMobile,
  addCredits,
  activeCategory,
  backToCategoryButton,
  maxWidth,
  marginTopChildren = true,
  showResourcesDropdownMenu = true,
}: Props) => {
  return (
    <MainLayout footerVariant="dark">
      <div
        className={cn(
          'flex h-fit justify-center p-4 md:p-10 relative',
          className,
        )}
      >
        <div
          className={cn(
            'w-full text-black',
            maxWidth === '1360' ? 'max-w-[1360px]' : 'max-w-6xl',
          )}
        >
          <CategoryTabs resourceActiveCategory={activeCategory} />
          {showResourcesDropdownMenu && (
            <ResourcesDropdownMenu
              resourceActiveCategory={activeCategory}
              backToCategoryButton={backToCategoryButton}
            />
          )}

          {showPageHeader && (
            <PageHeader
              title={title}
              description={tagLine || ''}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              link={link ? link : ''}
              hasGithubDescription={true}
              addedCredits={addCredits}
              hideOnMobile={hidePageHeaderMobile}
              increaseHorizontalPadding={maxWidth === '1360'}
            />
          )}

          {filterBar && (
            <div className="flex justify-center my-3 sm:my-6 md:my-8">
              <FilterBar {...filterBar} />
            </div>
          )}

          <div className={cn(marginTopChildren && 'mt-4 md:mt-[60px]')}>
            {children}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
