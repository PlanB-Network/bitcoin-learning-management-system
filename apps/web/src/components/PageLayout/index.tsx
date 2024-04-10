import type { ReactNode } from 'react';

import { cn } from '@sovereign-university/ui';

import { MainLayout } from '#src/components/MainLayout/index.tsx';
import { PageHeader } from '#src/components/PageHeader/index.tsx';

interface Props {
  title?: string;
  subtitle?: string;
  description?: string;
  link?: string;
  variant?: 'light' | 'dark' | 'blue';
  footerVariant?: 'dark' | 'light' | 'course';
  children: ReactNode;
  className?: string;
  maxWidth?: string;
  paddingXClasses?: string;
}

export const PageLayout = ({
  title,
  subtitle,
  description,
  link,
  variant = 'dark',
  footerVariant = 'dark',
  children,
  className,
  maxWidth = 'max-w-6xl',
  paddingXClasses = 'px-2 md:px-10',
}: Props) => {
  return (
    <MainLayout variant={variant} footerVariant={footerVariant}>
      <div
        className={cn('flex h-fit justify-center', className, paddingXClasses)}
      >
        <div className={cn('w-full', maxWidth)}>
          <PageHeader
            title={title || ''}
            subtitle={subtitle || ''}
            description={description || ''}
            link={link}
          />

          <div className="my-4 sm:my-6">{children}</div>
        </div>
      </div>
    </MainLayout>
  );
};
