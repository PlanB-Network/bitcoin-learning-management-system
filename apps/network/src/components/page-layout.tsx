import { cn } from '@blms/ui';
import type { ReactNode } from 'react';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import DesktopMenu from './desktop-menu.tsx';
import { MobileMenu } from './mobile-menu.tsx';

interface Props {
  children?: ReactNode;
  className?: string;
}

export const PageLayout = ({ children, className }: Props) => {
  const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu } =
    useDisclosure();

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
          <MobileMenu
            isMobileMenuOpen={isMobileMenuOpen}
            toggleMobileMenu={toggleMobileMenu}
          />
          {children && <div>{children}</div>}
        </div>
      </div>
    </div>
  );
};
