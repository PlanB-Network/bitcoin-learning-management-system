import { cn } from '@blms/ui';
import type { ReactNode } from 'react';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import DesktopMenu from './desktop-menu.tsx';
import { Footer } from './footer.tsx';
import { MobileMenu } from './mobile-menu.tsx';

interface Props {
  children?: ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
}

export const PageLayout = ({
  children,
  className,
  variant = 'dark',
}: Props) => {
  const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu } =
    useDisclosure();

  return (
    <div
      className={cn(
        'whitespace-pre-wrap',
        variant === 'dark' ? 'bg-black text-white' : 'bg-white text-black',
      )}
    >
      <div className={cn('flex h-fit justify-center w-full', className)}>
        <div className="w-full">
          <DesktopMenu variant={variant} />
          <MobileMenu
            isMobileMenuOpen={isMobileMenuOpen}
            toggleMobileMenu={toggleMobileMenu}
          />
          {children && <div>{children}</div>}
          <Footer />
        </div>
      </div>
    </div>
  );
};
