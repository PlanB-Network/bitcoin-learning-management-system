import React, { StrictMode, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Outlet,
  RouterProvider,
  Link,
  Router,
  Route,
  RootRoute,
} from '@tanstack/react-router';
import { compose } from '../utils';
import { Header } from '../components/Header';

// Create a root route
export const rootRoute = new RootRoute({
  component: Root,
});

function Root() {
  const box = useRef<HTMLDivElement | null>(null);
  const variant = '';

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
      className={compose(
        'h-full w-full',
        'bg-primary' //TODO TRIGGER -900
      )}
      ref={box}
    >
      <Header />
      <Outlet />

      {/* TODO TRIGGER footer */}
    </div>
  );
}
