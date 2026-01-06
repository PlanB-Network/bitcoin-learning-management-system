import { cn } from '@blms/ui';
import type { ReactNode } from 'react';

type PageBlockProps = {
  children?: ReactNode;
  className?: string;
  withXMargin?: boolean;
  withXPadding?: boolean;
  withYPadding?: boolean;
  variant?: 'blog' | 'base';
};

export default function PageBlock({
  children,
  className,
  withXMargin = true,
  withXPadding = true,
  withYPadding = true,
  variant = 'base',
}: PageBlockProps) {
  return (
    <div
      className={cn(
        withXMargin ? 'max-w-[1320px] mx-auto' : '',
        withXPadding ? 'px-5 md:px-8 lg:px-12' : '',
        withYPadding ? 'py-10 lg:py-30' : '',
        variant === 'blog' ? 'max-w-[680px] max-md:px-3 mt-2' : '',
        className,
      )}
    >
      {children && <div>{children}</div>}
    </div>
  );
}
