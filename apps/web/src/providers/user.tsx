import { createContext, useEffect, useState } from 'react';

import type { UserDetails } from '@sovereign-university/types';

import { trpcClient } from '#src/utils/trpc.js';

interface UserContext {
  user: UserDetails | null;
  setUser: (user: UserDetails | null) => void;
}

export const UserContext = createContext<UserContext>({
  user: null,
  setUser: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserDetails | null>(null);

  useEffect(() => {
    trpcClient.user.getDetails
      .query()
      .then((data) => data ?? null)
      .then(setUser)
      .catch(() => null);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
