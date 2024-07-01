import type { PropsWithChildren } from 'react';
import { createContext, useEffect, useState } from 'react';

import type { UserDetails } from '@sovereign-university/types';

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
}

export const AppContext = createContext<AppContext>({
  // User
  user: null,
  setUser: () => {},
  // Session
  session: null,
  setSession: () => {},
});

export const AppContextProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [session, setSession] = useState<Session | null>(null);

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
  }, []);

  const appContext: AppContext = {
    user,
    setUser,
    session,
    setSession,
  };

  return (
    <AppContext.Provider value={appContext}>{children}</AppContext.Provider>
  );
};
