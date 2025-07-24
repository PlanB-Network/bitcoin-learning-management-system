import { cn } from '@blms/ui';
import type { ReactNode } from 'react';

import { MainLayout } from './layouts/main-layout.tsx';
import { PageHeader } from './page-header.tsx';

interface Props {
  title?: string;
  subtitle?: string;
  description?: string;
  link?: string;
  variant?: 'light' | 'dark';
  footerVariant?: 'dark' | 'light';
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
  variant = 'dark',
  footerVariant = 'dark',
  children,
  className,
  maxWidth = 'max-w-6xl',
  paddingXClasses = 'px-4',
  hideDescriptionOnMobile = true,
}: Props) => {
  return (
    <MainLayout variant={variant} footerVariant={footerVariant}>
      <div
        className={cn('flex h-fit justify-center', className, paddingXClasses)}
      >
        <div className={cn('w-full pb-[100px]', maxWidth)}>
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
