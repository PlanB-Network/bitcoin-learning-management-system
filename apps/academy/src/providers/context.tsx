import { UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared';
import type {
  JoinedCourse,
  JoinedTutorialLight,
  SessionData,
  UserAccountSettings,
  UserDetails,
} from '@blms/types';
import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';
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
  refetchCourses: () => Promise<void>;

  // Register Toast
  hasSeenRegisterToast: boolean;
  setHasSeenRegisterToast: (value: boolean) => void;

  university: string | null;
  setUniversity: (university: string | null) => void;

  // Sidebar open state
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;

  // Sidebar current tab
  currentSidebarTab: string;
  setCurrentSidebarTab: (tab: string) => void;
}

export const AppContext = createContext<AppContext>({
  accountSettings: null,
  courses: null,
  fetchUserDetailsAndSettings: async () => {},
  hasSeenRegisterToast: false,
  isSidebarOpen: false,
  currentSidebarTab: 'learn',
  refetchCourses: async () => {},
  session: undefined,
  setAccountSettings: () => {},
  setCourses: () => {},
  setHasSeenRegisterToast: () => {},
  setSession: () => {},
  setTutorials: () => {},
  setUniversity: () => {},
  setIsSidebarOpen: () => {},
  setCurrentSidebarTab: () => {},
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

  const [hasSeenRegisterToast, setHasSeenRegisterToast] =
    useState<boolean>(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const [currentSidebarTab, setCurrentSidebarTab] = useState<string>('learn');
  const [hasInitializedTab, setHasInitializedTab] = useState<boolean>(false);

  const [university, setUniversityState] = useState<string | null>(() => {
    return getStoredUniversity();
  });

  const setUniversity = (university: string | null) => {
    setUniversityState(university);
    setStoredUniversity(university);
  };

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

  const refetchCourses = useCallback(async () => {
    try {
      const data = await trpcClient.content.getCourses.query({
        language: i18n.language,
      });
      setCourses(data ?? null);
    } catch (error) {
      console.error('Failed to refetch courses:', error);
    }
  }, [i18n.language]);

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

  // Listen for university updates from URL parameters across the app
  useEffect(() => {
    const checkUrlForUniversity = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const universityParam = urlParams.get('university');

      if (universityParam && universityParam !== university) {
        setUniversity(universityParam);
      }
    };

    checkUrlForUniversity();
  }, [university]);

  useEffect(() => {
    fetchUserDetailsAndSettings();

    trpcClient.content.getTutorials
      .query({
        language: i18n.language,
        notArchivedOnly: true,
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
  }, [i18n.language]);

  useEffect(() => {
    if (user !== undefined && !hasInitializedTab) {
      const defaultTab = getDefaultTabForUser(user);
      setCurrentSidebarTab(defaultTab);
      setHasInitializedTab(true);
    }
  }, [user, hasInitializedTab]);

  useEffect(() => {
    setHasInitializedTab(false);
  }, [user?.uid]);

  const appContext: AppContext = {
    accountSettings,
    courses,
    fetchUserDetailsAndSettings,
    hasSeenRegisterToast,
    isSidebarOpen,
    currentSidebarTab,
    refetchCourses,
    session,
    setAccountSettings,
    setCourses,
    setHasSeenRegisterToast,
    setSession,
    setTutorials,
    setUniversity,
    setIsSidebarOpen,
    setCurrentSidebarTab,
    setUser,
    tutorials,
    university,
    user,
  };

  return (
    <AppContext.Provider value={appContext}>{children}</AppContext.Provider>
  );
};

// University tracker utilities
const UNIVERSITY_STORAGE_KEY = 'university';
const UNIVERSITY_TTL_DAYS = 30;

interface UniversityTrackerData {
  university: string;
  timestamp: number;
  expiresAt: number;
}

const getStoredUniversity = (): string | null => {
  try {
    const stored = localStorage.getItem(UNIVERSITY_STORAGE_KEY);
    if (!stored) return null;

    const data: UniversityTrackerData = JSON.parse(stored);
    const now = Date.now();

    if (now > data.expiresAt) {
      localStorage.removeItem(UNIVERSITY_STORAGE_KEY);
      return null;
    }

    return data.university;
  } catch {
    try {
      localStorage.removeItem(UNIVERSITY_STORAGE_KEY);
    } catch {}
    return null;
  }
};

const setStoredUniversity = (university: string | null): void => {
  try {
    if (university) {
      const now = Date.now();
      const expiresAt = now + UNIVERSITY_TTL_DAYS * 24 * 60 * 60 * 1000;

      const data: UniversityTrackerData = {
        university,
        timestamp: now,
        expiresAt,
      };

      localStorage.setItem(UNIVERSITY_STORAGE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(UNIVERSITY_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to set university in localStorage:', err);
  }
};

// Helper function to determine the correct tab based on user role
const getDefaultTabForUser = (user: UserDetails | null | undefined): string => {
  if (!user) return 'learn';

  const path = window.location.pathname;
  const isOnAdminPage = path.includes('/dashboard/administration');
  const isOnProfessorPage = path.includes('/dashboard/professor');

  if (canAccess(UserRole.Admin)(user) && isOnAdminPage) return 'admin';
  if (canAccess(UserRole.Professor)(user) && isOnProfessorPage) return 'teach';
  return 'learn';
};
