import { useEffect, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';
import { LocalStorageKey } from '@sovereign-academy/types';

import { useAppDispatch } from './hooks';
import { Home } from './pages';
import { Companies } from './pages/Companies';
import { Company } from './pages/Company';
import { userSlice } from './store';
import { Routes as RoutesEnum } from './types';
import { getItem, removeItem } from './utils/local-storage';

export const App = () => {
  const dispatch = useAppDispatch();
  const accessToken = useMemo(() => getItem(LocalStorageKey.AccessToken), []);
  const userQuery = trpc.user.getMe.useQuery(undefined, {
    enabled: !!accessToken,
    retry: 1,
  });

  useEffect(() => {
    // Expired token
    if (userQuery.error?.data?.httpStatus === 401)
      removeItem(LocalStorageKey.AccessToken);
  }, [userQuery.error?.data?.httpStatus]);

  useEffect(() => {
    const { isLoggedIn, accessToken, user } = userQuery.data ?? {};
    if (isLoggedIn && accessToken && user)
      dispatch(
        userSlice.actions.login({
          username: user.username,
          accessToken: accessToken,
        })
      );
  }, [dispatch, accessToken, userQuery.data]);

  /**
   * Routes nest inside one another. Nested route paths build upon
   * parent route paths, and nested route elements render inside
   * parent route elements. See the note about <Outlet> below.
   */
  return (
    <Routes>
      <Route path="/">
        <Route index element={<Home />} />
        <Route path={RoutesEnum.Companies} element={<Companies />} />
        <Route path={RoutesEnum.Company} element={<Company />} />
        <Route path="*" element={<h1>TODO</h1>} />
      </Route>
    </Routes>
  );
};
