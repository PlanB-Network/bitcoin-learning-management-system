import { useRef } from 'react';

import { cn } from '@blms/ui';

import { Footer } from './footer.tsx';
import { Header } from './Header/index.tsx';
import ScrollToTopButton from './scroll-to-top-button.tsx';

interface MainLayoutProps {
  children: JSX.Element | JSX.Element[];
  variant?: 'light' | 'dark' | 'blue' | 'gray';
  showFooter?: boolean;
  fillScreen?: boolean;
  headerVariant?: 'light' | 'dark';
  footerVariant?: 'light' | 'dark';
}

export const MainLayout = ({
  children,
  variant = 'dark',
  showFooter = true,
  fillScreen,
  footerVariant,
  headerVariant,
}: MainLayoutProps) => {
  const box = useRef<HTMLDivElement | null>(null);

  const bgColorClasses = {
    light: 'bg-white',
    dark: 'bg-black',
    blue: 'bg-blue-200',
    gray: 'bg-newGray-6',
  };
  return (
    <div
      className={cn(
        'text-white flex flex-col',
        bgColorClasses[variant],
        fillScreen ? 'min-h-dvh' : '',
      )}
      ref={box}
    >
      {/* Header */}
      <Header variant={headerVariant} />

      {/* Content */}
      <main className="grow">{children}</main>

      {/* Footer */}
      {showFooter && <Footer variant={footerVariant} />}

      <ScrollToTopButton />
    </div>
  );
};
