import type {
  JoinedBlogLight,
  JoinedCourse,
  JoinedTutorialLight,
  SessionData,
  UserAccountSettings,
  UserDetails,
} from '@blms/types';
import type { PropsWithChildren } from 'react';
import { createContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { trpcClient } from '#src/utils/trpc.js';

interface Session {
  user: SessionData;
}

interface AppContext {
  // User
  user: UserDetails | null | undefined;
  setUser: (user: UserDetails | null) => void;

  // Account settings
  accountSettings: UserAccountSettings | null;
  setAccountSettings: (settings: UserAccountSettings | null) => void;

  // Fetch functions
  fetchUserDetailsAndSettings: () => Promise<void>;

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

  // Register Toast
  hasSeenRegisterToast: boolean;
  setHasSeenRegisterToast: (value: boolean) => void;

  university: string | null;
  setUniversity: (university: string | null) => void;
}

export const AppContext = createContext<AppContext>({
  accountSettings: null,
  blogs: null,
  courses: null,
  fetchUserDetailsAndSettings: async () => {},
  hasSeenRegisterToast: false,
  session: undefined,
  setAccountSettings: () => {},
  setBlogs: () => {},
  setCourses: () => {},
  setHasSeenRegisterToast: () => {},
  setSession: () => {},
  setTutorials: () => {},
  setUniversity: async () => {},
  setUser: () => {},
  tutorials: null,
  university: null,
  user: undefined,
});

export const AppContextProvider = ({ children }: PropsWithChildren) => {
  const { i18n } = useTranslation();

  const [user, setUser] = useState<UserDetails | null | undefined>(undefined);
  const [accountSettings, setAccountSettings] =
    useState<UserAccountSettings | null>(null);
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [tutorials, setTutorials] = useState<JoinedTutorialLight[] | null>(
    null,
  );
  const [courses, setCourses] = useState<JoinedCourse[] | null>(null);
  const [blogs, setBlogs] = useState<JoinedBlogLight[] | null>(null);

  const [hasSeenRegisterToast, setHasSeenRegisterToast] =
    useState<boolean>(false);

  const [university, setUniversity] = useState<string | null>(null);

  const fetchUserDetailsAndSettings = async () => {
    try {
      let currentSession = session;

      if (!currentSession) {
        const sessionData = await trpcClient.user.getSession.query();
        if (sessionData?.uid && sessionData.role) {
          currentSession = { user: sessionData };
          setSession(currentSession);
        } else {
          setSession(null);
          setUser(null);
          setAccountSettings(null);
          return;
        }
      }

      const detailsData = await trpcClient.user.getDetails.query();
      setUser(detailsData ?? null);

      const accountSettingsData =
        await trpcClient.user.getAccountSettings.query();
      setAccountSettings(accountSettingsData ?? null);
    } catch {
      setSession(null);
      setUser(null);
      setAccountSettings(null);
    }
  };

  // Listen for logout events from other tabs
  useEffect(() => {
    const channel = new BroadcastChannel('auth');

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'LOGOUT') {
        setSession(null);
        setUser(null);
        setAccountSettings(null);
        window.location.reload();
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, []);

  useEffect(() => {
    fetchUserDetailsAndSettings();

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
    accountSettings,
    blogs,
    courses,
    fetchUserDetailsAndSettings,
    hasSeenRegisterToast,
    session,
    setAccountSettings,
    setBlogs,
    setCourses,
    setHasSeenRegisterToast,
    setSession,
    setTutorials,
    setUniversity,
    setUser,
    tutorials,
    university,
    user,
  };

  return (
    <AppContext.Provider value={appContext}>{children}</AppContext.Provider>
  );
};
