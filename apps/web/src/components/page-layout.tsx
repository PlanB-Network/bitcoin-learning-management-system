import { cn } from '@blms/ui';
import type { ReactNode } from 'react';

import { PageHeader } from '#src/components/page-header.tsx';

import { MainLayout } from './main-layout.tsx';
import { SecondaryNavbar } from './ui/secondary-navbar.tsx';

interface Props {
  title?: string;
  subtitle?: string;
  description?: string;
  link?: string;
  children?: ReactNode;
  className?: string;
  maxWidth?: string;
  paddingXClasses?: string;
  hideDescriptionOnMobile?: boolean;
  tabs?: { id: string; label: string; href: string }[];
}

export const PageLayout = ({
  title,
  subtitle,
  description,
  link,
  children,
  className,
  paddingXClasses = 'px-3 lg:px-10',
  hideDescriptionOnMobile = true,
  tabs = [],
}: Props) => {
  return (
    <MainLayout>
      {/** biome-ignore lint/complexity/noUselessFragments: <type issue> */}
      {tabs.length > 0 ? <SecondaryNavbar tabs={tabs} /> : <></>}
      <div
        className={cn('flex h-fit justify-center', className, paddingXClasses)}
      >
        <div className={cn('w-full')}>
          {title && (
            <PageHeader
              title={title}
              subtitle={subtitle}
              description={description}
              link={link}
              hideDescriptionOnMobile={hideDescriptionOnMobile}
            />
          )}
          {children && <div className="my-4 lg:my-6">{children}</div>}
        </div>
      </div>
    </MainLayout>
  );
};
