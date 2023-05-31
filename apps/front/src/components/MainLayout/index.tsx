import { useRef } from 'react';

import { Header } from '../../components';

export const MainLayout = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const box = useRef<HTMLDivElement | null>(null);

  return (
    <div className="pt-23 w-full h-full bg-gray-100" ref={box}>
      {/* Header */}
      <Header />

      {/* Content */}
      {children}
    </div>
  );
};
