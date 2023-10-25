import { useEffect, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';
import { LocalStorageKey } from '@sovereign-academy/types';

import { useAppDispatch, useScrollToTop } from './hooks';
import { Home } from './pages';
import { About } from './pages/About';
import { Book } from './pages/Book';
import { Books } from './pages/Books';
import { Builder } from './pages/Builder';
import { Builders } from './pages/Builders';
import { CourseChapter, CourseDetails, CoursesExplorer } from './pages/Courses';
import { NotFound } from './pages/NotFound';
import { Podcast } from './pages/Podcast';
import { Podcasts } from './pages/Podcasts';
import { Resources } from './pages/Resources';
import { Tutorials } from './pages/Tutorials';
import { UnderConstruction } from './pages/UnderConstruction';
import { userSlice } from './store';
import { Routes as RoutesEnum } from './types';
import { getItem, removeItem } from './utils';

export const App = () => {
  useScrollToTop();
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
        <Route
          path={RoutesEnum.UnderConstruction}
          element={<UnderConstruction />}
        />

        <Route path={RoutesEnum.Courses} element={<CoursesExplorer />} />
        <Route path={RoutesEnum.Course} element={<CourseDetails />} />
        <Route path={RoutesEnum.CourseChapter} element={<CourseChapter />} />

        <Route path={RoutesEnum.Resources} element={<Resources />} />
        <Route path={RoutesEnum.Books} element={<Books />} />
        <Route path={RoutesEnum.Book} element={<Book />} />
        <Route path={RoutesEnum.Podcasts} element={<Podcasts />} />
        <Route path={RoutesEnum.Podcast} element={<Podcast />} />
        <Route path={RoutesEnum.Builders} element={<Builders />} />
        <Route path={RoutesEnum.Builder} element={<Builder />} />
        <Route path={RoutesEnum.AboutUs} element={<About />} />

        <Route path={RoutesEnum.Tutorials} element={<Tutorials />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};