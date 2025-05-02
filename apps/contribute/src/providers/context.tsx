import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';

import type { SessionData, UserDetails } from '@blms/types';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '#src/utils/trpc.js';

interface AppContext {
  // User
  user: UserDetails | null | undefined;
  setUser: (user: UserDetails | null) => void;
  refetchUserDetails: () => Promise<void>;

  // Session
  session: SessionData | null | undefined;
  setSession: (session: SessionData | null) => void;
}

export const AppContext = createContext<AppContext>({
  // User
  user: undefined,
  setUser: () => {},
  refetchUserDetails: async () => {},

  // Session
  session: undefined,
  setSession: () => {},
});

export const AppContextProvider = ({ children }: PropsWithChildren) => {
  const trpc = useTRPC();

  const [user, setUser] = useState<UserDetails | null | undefined>(undefined);
  const [session, setSession] = useState<SessionData | null | undefined>(
    undefined,
  );

  const sessionQuery = useQuery(trpc.user.getSession.queryOptions());

  const isUserQueryEnabled = sessionQuery.isSuccess && !!sessionQuery.data;

  const userQuery = useQuery({
    ...trpc.user.getDetails.queryOptions(),
    enabled: isUserQueryEnabled,
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const refetchUserDetails = useCallback(
    async () => void (await userQuery.refetch()),
    [userQuery],
  );

  useEffect(() => {
    if (sessionQuery.isSuccess) {
      setSession(sessionQuery.data);
    } else {
      setSession(null);
    }
  }, [sessionQuery.isSuccess, sessionQuery.data]);

  useEffect(() => {
    if (isUserQueryEnabled && userQuery.isSuccess) {
      setUser(userQuery.data);
    } else {
      setUser(null);
    }
  }, [isUserQueryEnabled, userQuery.isSuccess, userQuery.data]);

  const appContext: AppContext = {
    user,
    setUser,
    refetchUserDetails,
    session,
    setSession,
  };

  return (
    <AppContext.Provider value={appContext}>{children}</AppContext.Provider>
  );
};
