import { cn } from '@blms/ui';
import type { ReactNode } from 'react';

import { PageHeader } from '#src/components/page-header.tsx';

import { MainLayout } from './main-layout.tsx';

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
}

export const PageLayout = ({
  title,
  subtitle,
  description,
  link,
  children,
  className,
  maxWidth = 'max-w-6xl',
  paddingXClasses = 'px-2 md:px-10',
  hideDescriptionOnMobile = true,
}: Props) => {
  return (
    <MainLayout>
      <div
        className={cn('flex h-fit justify-center', className, paddingXClasses)}
      >
        <div className={cn('w-full', maxWidth)}>
          {title && (
            <PageHeader
              title={title}
              subtitle={subtitle}
              description={description}
              link={link}
              hideDescriptionOnMobile={hideDescriptionOnMobile}
            />
          )}
          {children && <div className="my-4 sm:my-6">{children}</div>}
        </div>
      </div>
    </MainLayout>
  );
};
