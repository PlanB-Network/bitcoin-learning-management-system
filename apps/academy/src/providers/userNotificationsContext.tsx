import type { JoinedUserNotification } from '@blms/types';
import type { PropsWithChildren } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { trpcClient } from '#src/utils/trpc.js';
import { AppContext } from './context.tsx';

interface NotificationsContextValue {
  userNotifications: JoinedUserNotification[];
  fetchUserNotifications: () => Promise<void>;
}

export const NotificationsContext = createContext<NotificationsContextValue>({
  fetchUserNotifications: async () => {},
  userNotifications: [],
});

export const NotificationsProvider = ({ children }: PropsWithChildren) => {
  const { user } = useContext(AppContext);
  const [userNotifications, setUserNotifications] = useState<
    JoinedUserNotification[]
  >([]);

  const fetchUserNotifications = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const data =
        await trpcClient.user.notifications.getUserNotifications.query();
      setUserNotifications(data ?? []);
    } catch (error) {
      console.error('Failed to fetch user notifications:', error);
      setUserNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUserNotifications([]);
      return;
    }

    fetchUserNotifications();

    const intervalId = setInterval(fetchUserNotifications, 1 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [fetchUserNotifications, user]);

  const contextValue: NotificationsContextValue = {
    fetchUserNotifications,
    userNotifications,
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};
