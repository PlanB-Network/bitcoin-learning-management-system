import type { ReactNode } from 'react';

import { cn } from '@sovereign-university/ui';

import { MainLayout } from '#src/components/MainLayout/index.tsx';
import { PageHeader } from '#src/components/PageHeader/index.tsx';

interface Props {
  title: string;
  subtitle?: string;
  description?: string;
  link?: string;
  children: ReactNode;
  className?: string;
}

export const PageLayout = ({
  title,
  subtitle,
  description,
  link,
  children,
  className,
}: Props) => {
  return (
    <MainLayout footerVariant="dark">
      <div className={cn('flex h-fit justify-center p-2 md:p-10', className)}>
        <div className="w-full max-w-6xl text-black">
          <PageHeader
            title={title}
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
