import type { PropsWithChildren } from 'react';
import { createContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  JoinedBlogLight,
  JoinedCourse,
  JoinedTutorialLight,
  JoinedUserNotification,
  SessionData,
  UserDetails,
} from '@blms/types';

import { trpcClient } from '#src/utils/trpc.js';

interface Session {
  user: SessionData;
}

interface AppContext {
  // User
  user: UserDetails | null | undefined;
  setUser: (user: UserDetails | null) => void;
  refetchUserDetails: () => Promise<void>;

  // Session
  session: Session | null | undefined;
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

  // Notifications
  userNotifications: JoinedUserNotification[];
  setUserNotifications: (userNotifications: JoinedUserNotification[]) => void;
  fetchUserNotifications: () => Promise<void>;

  // Register Toast
  hasSeenRegisterToast: boolean;
  setHasSeenRegisterToast: (value: boolean) => void;
}

export const AppContext = createContext<AppContext>({
  // User
  user: undefined,
  setUser: () => {},
  refetchUserDetails: async () => {},

  // Session
  session: undefined,
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

  // Notifications
  userNotifications: [],
  setUserNotifications: () => {},
  fetchUserNotifications: async () => {},

  // Register Toast
  hasSeenRegisterToast: false,
  setHasSeenRegisterToast: () => {},
});

export const AppContextProvider = ({ children }: PropsWithChildren) => {
  const { i18n } = useTranslation();

  const [user, setUser] = useState<UserDetails | null | undefined>(undefined);
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [tutorials, setTutorials] = useState<JoinedTutorialLight[] | null>(
    null,
  );
  const [courses, setCourses] = useState<JoinedCourse[] | null>(null);
  const [blogs, setBlogs] = useState<JoinedBlogLight[] | null>(null);
  const [userNotifications, setUserNotifications] = useState<
    JoinedUserNotification[]
  >([]);

  const [hasSeenRegisterToast, setHasSeenRegisterToast] =
    useState<boolean>(false);

  const refetchUserDetails = async () => {
    try {
      const data = await trpcClient.user.getDetails.query();
      setUser(data ?? null);
    } catch {
      setUser(null);
    }
  };

  // Function to refetch user notifications
  const fetchUserNotifications = async () => {
    try {
      const data =
        await trpcClient.user.notifications.getUserNotifications.query();
      setUserNotifications(data ?? []);
    } catch {
      setUserNotifications([]);
    }
  };

  useEffect(() => {
    refetchUserDetails();

    trpcClient.user.getSession
      .query()
      .then((data) => {
        if (data?.uid && data.role) {
          const session: Session = { user: data };
          return setSession(session);
        }

        return setSession(null);
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

    fetchUserNotifications();
  }, [i18n.language]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    fetchUserNotifications();

    const intervalId = setInterval(
      () => {
        fetchUserNotifications();
      },
      1 * 60 * 1000,
    ); // 1 minute

    return () => clearInterval(intervalId);
  }, []);

  const appContext: AppContext = {
    user,
    setUser,
    refetchUserDetails,
    session,
    setSession,
    tutorials,
    setTutorials,
    courses,
    setCourses,
    blogs,
    setBlogs,
    userNotifications,
    setUserNotifications,
    fetchUserNotifications,
    hasSeenRegisterToast,
    setHasSeenRegisterToast,
  };

  return (
    <AppContext.Provider value={appContext}>{children}</AppContext.Provider>
  );
};
