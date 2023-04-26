import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import { Home } from './pages';

import './App.css';

export const App = () => {
  const userQuery = trpc.user.getUser.useQuery();

  useEffect(() => {
    console.log(userQuery.data);
  }, [userQuery]);

  /**
   * Routes nest inside one another. Nested route paths build upon
   * parent route paths, and nested route elements render inside
   * parent route elements. See the note about <Outlet> below.
   */
  return (
    <Routes>
      <Route path="/">
        <Route index element={<Home />} />
        {/* <Route path="about" element={<About />} />
          <Route path="dashboard" element={<Dashboard />} /> */}

        {/* Using path="*"" means "match anything", so this route
                acts like a catch-all for URLs that we don't have explicit
              routes for. */}
        {/* <Route path="*" element={<NoMatch />} /> */}
      </Route>
    </Routes>
  );
};
