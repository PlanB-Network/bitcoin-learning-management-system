import { useRef } from 'react';

import { Footer, Header } from '../../components';

interface MainLayoutProps {
  children: JSX.Element | JSX.Element[];
  footerVariant?: 'light' | 'dark' | 'course';
  footerColor?: string;
}

export const MainLayout = ({
  children,
  footerVariant,
  footerColor,
}: MainLayoutProps) => {
  const box = useRef<HTMLDivElement | null>(null);

  return (
    <div className="md:pt-23 bg-primary-900 h-full w-full pt-16" ref={box}>
      {/* Header */}
      <Header />

      {/* Content */}
      {children}

      {/* Footer */}
      <Footer variant={footerVariant} color={footerColor} />
    </div>
  );
};
