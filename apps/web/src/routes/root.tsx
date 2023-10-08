import { Outlet, RootRoute } from '@tanstack/react-router';
import { useRef } from 'react';

import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import ScrollToTopButton from '../components/ScrollToTopButton';
import { compose } from '../utils';

// eslint-disable-next-line react-refresh/only-export-components
const Root = () => {
  const box = useRef<HTMLDivElement | null>(null);
  // const variant = '';

  return (
    <div
      // className={compose(
      //   'h-full w-full',
      //   variant === 'light'
      //     ? 'bg-gray-100'
      //     : variant === 'blue'
      //     ? 'bg-blue-200'
      //     : 'bg-primary'
      // )}
      className={compose('h-full w-full', 'bg-blue-900')}
      ref={box}
    >
      <Header />
      <Outlet />

      {/* TODO TRIGGER footer with good params */}
      {/* {showFooter && <Footer variant={footerVariant} color={footerColor} />} */}
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

// Create a root route
export const rootRoute = new RootRoute({
  component: Root,
});
