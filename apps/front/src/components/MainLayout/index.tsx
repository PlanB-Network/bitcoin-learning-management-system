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
    <div className="pt-23 h-full w-full bg-gray-100" ref={box}>
      {/* Header */}
      <Header />

      {/* Content */}
      {children}

      {/* Footer */}
      <Footer variant={footerVariant} color={footerColor} />
    </div>
  );
};
