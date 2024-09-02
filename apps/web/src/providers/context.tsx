import type { PropsWithChildren } from 'react';
import { createContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  JoinedBlogLight,
  JoinedTutorialLight,
  UserDetails,
} from '@blms/types';

import { trpcClient } from '#src/utils/trpc.js';

interface Session {
  user: {
    uid: string;
    role: 'student' | 'professor' | 'community' | 'admin' | 'superadmin';
    professorId: number | null;
    professorName: string;
    professorPath: string;
    professorTwitterUrl: string;
    professorWebsiteUrl: string;
    professorGithubUrl: string;
    professorNostr: string;
    professorCourses: string[];
    professorTutorials: number[];
    professorShortBio: { [key: string]: string };
    professorTags: string[];
    professorLightningAddress: string;
    professorLastCommit: string;
  };
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

  // Blog
  blogs: JoinedBlogLight[] | null;
  setBlogs: (blogs: JoinedBlogLight[] | null) => void;
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

  // Blog
  blogs: null,
  setBlogs: () => {},
});

export const AppContextProvider = ({ children }: PropsWithChildren) => {
  const { i18n } = useTranslation();

  const [user, setUser] = useState<UserDetails | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [tutorials, setTutorials] = useState<JoinedTutorialLight[] | null>(
    null,
  );
  const [blogs, setBlogs] = useState<JoinedBlogLight[] | null>(null);

  useEffect(() => {
    trpcClient.user.getDetails
      .query()
      .then((data) => data ?? null)
      .then(setUser)
      .catch(() => null);

    trpcClient.user.getSession
      .query()
      .then((data) => {
        if (
          data &&
          data.user &&
          data.user.role &&
          data.user.professorId !== undefined
        ) {
          const validSession: Session = {
            user: {
              uid: data.user.uid,
              role: data.user.role,
              professorId: data.user.professorId,
              professorName: data.user.professorName || '',
              professorPath: data.user.professorPath || '',
              professorTwitterUrl: data.user.professorTwitterUrl || '',
              professorWebsiteUrl: data.user.professorWebsiteUrl || '',
              professorGithubUrl: data.user.professorGithubUrl || '',
              professorNostr: data.user.professorNostr || '',
              professorCourses: data.user.professorCourses || [],
              professorTutorials: data.user.professorTutorials || [],
              professorShortBio: data.user.professorShortBio || {},
              professorTags: data.user.professorTags || [],
              professorLightningAddress:
                data.user.professorLightningAddress || '',
              professorLastCommit: data.user.professorLastCommit || '',
            },
          };
          return setSession(validSession);
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
    blogs,
    setBlogs,
  };

  return (
    <AppContext.Provider value={appContext}>{children}</AppContext.Provider>
  );
};
