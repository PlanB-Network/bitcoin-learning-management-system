import type { PropsWithChildren } from 'react';
import { createContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  JoinedBlogLight,
  JoinedCourse,
  JoinedTutorialLight,
  SessionData,
  UserDetails,
} from '@blms/types';

import { trpcClient } from '#src/utils/trpc.js';

interface Session {
  user: SessionData;
}

interface MempoolPrice {
  USD: number;
  EUR: number;
}

interface AppContext {
  // User
  user: UserDetails | null;
  setUser: (user: UserDetails | null) => void;

  // Session
  session: Session | null;
  setSession: (session: Session | null) => void;

  // Tutorials
  tutorials: JoinedTutorialLight[] | null;
  setTutorials: (tutorials: JoinedTutorialLight[] | null) => void;

  // Courses
  courses: JoinedCourse[] | null;
  setCourses: (courses: JoinedCourse[] | null) => void;

  // Blog
  blogs: JoinedBlogLight[] | null;
  setBlogs: (blogs: JoinedBlogLight[] | null) => void;

  // Conversion rate
  conversionRate: number | null;
  setConversionRate: (rate: number | null) => void;
}

export const AppContext = createContext<AppContext>({
  // User
  user: null,
  setUser: () => {},

  // Session
  session: null,
  setSession: () => {},

  // Tutorials
  tutorials: null,
  setTutorials: () => {},

  // Courses
  courses: null,
  setCourses: () => {},

  // Blog
  blogs: null,
  setBlogs: () => {},

  // Conversion Rate
  conversionRate: null,
  setConversionRate: () => {},
});

export const AppContextProvider = ({ children }: PropsWithChildren) => {
  const { i18n } = useTranslation();

  const [user, setUser] = useState<UserDetails | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [tutorials, setTutorials] = useState<JoinedTutorialLight[] | null>(
    null,
  );
  const [courses, setCourses] = useState<JoinedCourse[] | null>(null);
  const [blogs, setBlogs] = useState<JoinedBlogLight[] | null>(null);
  const [conversionRate, setConversionRate] = useState<number | null>(null);

  const fetchConversionRate = async (): Promise<void> => {
    try {
      const response = await fetch('https://mempool.space/api/v1/prices');
      const data: MempoolPrice = await response.json();

      if (data?.USD) {
        setConversionRate(data.USD);
      } else {
        throw new Error(
          'Failed to retrieve conversion rate from mempool.space.',
        );
      }
    } catch (error) {
      console.error('Error fetching conversion rate:', error);
    }
  };

  useEffect(() => {
    fetchConversionRate();

    const interval = setInterval(fetchConversionRate, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    trpcClient.user.getDetails
      .query()
      .then((data) => data ?? null)
      .then(setUser)
      .catch(() => null);

    trpcClient.user.getSession
      .query()
      .then((data) => {
        if (data && data.uid && data.role) {
          const session: Session = { user: data };
          return setSession(session);
        } else {
          return setSession(null);
        }
      })
      .catch(() => null);

    trpcClient.content.getTutorials
      .query({
        language: i18n.language,
      })
      .then((data) => data ?? null)
      .then(setTutorials)
      .catch(() => null);

    trpcClient.content.getCourses
      .query({
        language: i18n.language,
      })
      .then((data) => data ?? null)
      .then(setCourses)
      .catch(() => null);

    trpcClient.content.getBlogs
      .query({
        language: i18n.language,
      })
      .then((data) => {
        return data ?? null;
      })
      .then(setBlogs)
      .catch(() => {});
  }, [i18n.language]);

  const appContext: AppContext = {
    user,
    setUser,
    session,
    setSession,
    tutorials,
    setTutorials,
    courses,
    setCourses,
    blogs,
    setBlogs,
    conversionRate,
    setConversionRate,
  };

  return (
    <AppContext.Provider value={appContext}>{children}</AppContext.Provider>
  );
};
