import { useRef } from 'react';

import { Header } from '../../components';

export const MainLayout = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const box = useRef<HTMLDivElement | null>(null);

  return (
    <div className="overflow-auto mt-24 h-screen bg-gray-100" ref={box}>
      {/* Header */}
      <Header />

      {/* Content */}
      {children}
    </div>
  );
};
