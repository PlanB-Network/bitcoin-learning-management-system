import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';
import { LocalStorageKey } from '@sovereign-academy/types';

import { useAppDispatch, useScrollToTop } from './hooks';
import { Home } from './pages';
// About
import { Manifesto } from './pages/About/Manifesto';
import { SponsorsAndContributors } from './pages/About/SponsorsAndContributors';
// Courses
import { CourseChapter, CourseDetails, CoursesExplorer } from './pages/Courses';
// Misc
import { NotFound } from './pages/Misc/NotFound';
import { UnderConstruction } from './pages/Misc/UnderConstruction';
// Resources
import { Resources } from './pages/Resources';
import { Book } from './pages/Resources/Book';
import { Books } from './pages/Resources/Books';
import { Builder } from './pages/Resources/Builder';
import { Builders } from './pages/Resources/Builders';
import { Podcast } from './pages/Resources/Podcast';
import { Podcasts } from './pages/Resources/Podcasts';
// Tutorials
import { Tutorials } from './pages/Tutorials';
import { Tutorial } from './pages/Tutorials/Tutorial';
import { TutorialCategory } from './pages/Tutorials/TutorialCategory';
import { userSlice } from './store';
import { Routes as RoutesEnum } from './types';
import { getItem, removeItem } from './utils';

export const App = () => {
  const { i18n } = useTranslation();
  useScrollToTop();
  const dispatch = useAppDispatch();
  const accessToken = useMemo(() => getItem(LocalStorageKey.AccessToken), []);
  const userQuery = trpc.user.getMe.useQuery(undefined, {
    enabled: !!accessToken,
    retry: 1,
  });

  // Temporary fix: the default language can be en-GB (or equivalent), until it is properly set with the selector
  // and these aren't supported. Fallback to 'en' in that case for now.
  if (i18n.language.includes('-')) {
    i18n.changeLanguage('en');
  }

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
        <Route path={RoutesEnum.Manifesto} element={<Manifesto />} />
        <Route
          path={RoutesEnum.SponsorsAndContributors}
          element={<SponsorsAndContributors />}
        />

        <Route path={RoutesEnum.Tutorials} element={<Tutorials />} />
        <Route path={RoutesEnum.Tutorial} element={<Tutorial />} />
        <Route
          path={RoutesEnum.TutorialCategory}
          element={<TutorialCategory />}
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
