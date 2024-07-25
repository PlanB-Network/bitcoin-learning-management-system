import type { PropsWithChildren } from 'react';
import { createContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { JoinedTutorialLight, UserDetails } from '@blms/types';

import { trpcClient } from '#src/utils/trpc.js';

interface Session {
  user: { uid: string };
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
});

export const AppContextProvider = ({ children }: PropsWithChildren) => {
  const { i18n } = useTranslation();

  const [user, setUser] = useState<UserDetails | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [tutorials, setTutorials] = useState<JoinedTutorialLight[] | null>(
    null,
  );

  useEffect(() => {
    trpcClient.user.getDetails
      .query()
      .then((data) => data ?? null)
      .then(setUser)
      .catch(() => null);

    trpcClient.user.getSession
      .query()
      .then((data) => data ?? null)
      .then(setSession)
      .catch(() => null);

    trpcClient.content.getTutorials
      .query({
        language: i18n.language,
      })
      .then((data) => data ?? null)
      .then(setTutorials)
      .catch(() => null);
  }, [i18n.language]);

  const appContext: AppContext = {
    user,
    setUser,
    session,
    setSession,
    tutorials,
    setTutorials,
  };

  return (
    <AppContext.Provider value={appContext}>{children}</AppContext.Provider>
  );
};
