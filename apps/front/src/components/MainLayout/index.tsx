import { useScroll } from '@react-hooks-library/core';
import { useRef, useState } from 'react';

import { Header } from '../../components';

export const MainLayout = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const box = useRef<HTMLDivElement | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  useScroll(box, ({ scrollY }) => {
    setHasScrolled(scrollY > 0);
  });

  return (
    <div
      ref={box}
      style={{ height: '100vh', overflow: 'auto', paddingTop: '150px' }}
    >
      {/* Header */}
      <Header isExpanded={!hasScrolled} />

      {/* Content */}
      {children}
    </div>
  );
};
