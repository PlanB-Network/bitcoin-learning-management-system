import { cn } from '@blms/ui';
import type { ReactNode } from 'react';

type PageBlockProps = {
  children?: ReactNode;
  className?: string;
};

export default function PageBlock({ children, className }: PageBlockProps) {
  return (
    <div className={cn('px-5 md:px-12 max-w-[1320px] mx-auto', className)}>
      {children && <div>{children}</div>}
    </div>
  );
}
