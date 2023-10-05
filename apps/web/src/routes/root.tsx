import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Outlet,
  RouterProvider,
  Link,
  Router,
  Route,
  RootRoute,
} from '@tanstack/react-router';

// Create a root route
export const rootRoute = new RootRoute({
  component: Root,
});

function Root() {
  return (
    <>
      <h1>ROOT</h1>
      <Outlet />
    </>
  );
}
