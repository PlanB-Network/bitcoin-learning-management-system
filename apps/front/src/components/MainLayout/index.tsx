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
      className="overflow-auto pt-28 h-screen sm:pt-36 md:pt-44 lg:pt-52"
      ref={box}
    >
      {/* Header */}
      <Header isExpanded={!hasScrolled} />

      {/* Content */}
      {children}
    </div>
  );
};
