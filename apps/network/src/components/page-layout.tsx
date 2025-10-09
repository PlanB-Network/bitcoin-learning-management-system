import { cn } from '@blms/ui';
import type { ReactNode } from 'react';
import DesktopMenu from './desktop-menu.tsx';

interface Props {
  children?: ReactNode;
  className?: string;
}

export const PageLayout = ({ children, className }: Props) => {
  return (
    <div className="bg-black text-white whitespace-pre-wrap">
      <div
        className={cn(
          'flex h-fit justify-center pb-16 md:pb-40 w-full',
          className,
        )}
      >
        <div className="w-full">
          <DesktopMenu />
          {children && <div>{children}</div>}
        </div>
      </div>
    </div>
  );
};
