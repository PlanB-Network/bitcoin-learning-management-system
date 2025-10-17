import { cn } from '@blms/ui';
import type { ReactNode } from 'react';

type PageBlockProps = {
  children?: ReactNode;
  className?: string;
  withXMargin?: boolean;
  withXPadding?: boolean;
  withYPadding?: boolean;
};

export default function PageBlock({
  children,
  className,
  withXMargin = true,
  withXPadding = true,
  withYPadding = true,
}: PageBlockProps) {
  return (
    <div
      className={cn(
        withXMargin ? 'max-w-[1320px] mx-auto' : '',
        withXPadding ? 'px-5 md:px-8 lg:px-12' : '',
        withYPadding ? 'py-10 lg:py-30' : '',
        className,
      )}
    >
      {children && <div>{children}</div>}
    </div>
  );
}
