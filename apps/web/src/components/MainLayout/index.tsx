import { useRef } from 'react';

import { compose } from '../../utils/index.ts';
import { Footer } from '../Footer/index.tsx';
import { Header } from '../Header/index.tsx';
import ScrollToTopButton from '../ScrollToTopButton/index.tsx';

interface MainLayoutProps {
  children: JSX.Element | JSX.Element[];
  variant?: 'light' | 'dark' | 'blue';
  showFooter?: boolean;
  fillScreen?: boolean;
  headerVariant?: 'light' | 'dark';
  footerVariant?: 'light' | 'dark' | 'course';
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

  return (
    <div
      className={compose(
        'text-white',
        variant === 'light'
          ? 'bg-gray-100'
          : variant === 'blue'
            ? 'bg-blue-200'
            : 'bg-blue-1000',
        fillScreen ? 'min-h-dvh' : '',
      )}
      ref={box}
    >
      {/* Header */}
      <Header variant={headerVariant} />

      {/* Content */}
      {children}

      {/* Footer */}
      {showFooter && <Footer variant={footerVariant} />}

      <ScrollToTopButton />
    </div>
  );
};
