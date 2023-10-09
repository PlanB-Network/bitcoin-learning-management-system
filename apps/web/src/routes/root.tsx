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

  return <Outlet />;
};

// Create a root route
export const rootRoute = new RootRoute({
  component: Root,
});
