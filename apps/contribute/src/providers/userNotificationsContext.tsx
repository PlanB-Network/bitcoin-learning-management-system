import type { PropsWithChildren } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import type { JoinedUserNotification } from '@blms/types';

import { trpcClient } from '#src/utils/trpc.js';
import { AppContext } from './context.tsx';
interface NotificationsContextValue {
  userNotifications: JoinedUserNotification[];
  fetchUserNotifications: () => Promise<void>;
}

export const NotificationsContext = createContext<NotificationsContextValue>({
  userNotifications: [],
  fetchUserNotifications: async () => {},
});

export const NotificationsProvider = ({ children }: PropsWithChildren) => {
  const { user } = useContext(AppContext);
  const [userNotifications, setUserNotifications] = useState<
    JoinedUserNotification[]
  >([]);

  const fetchUserNotifications = useCallback(async () => {
    try {
      const data =
        await trpcClient.user.notifications.getUserNotifications.query();
      setUserNotifications(data ?? []);
    } catch (error) {
      console.error('Failed to fetch user notifications:', error);
      setUserNotifications([]);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserNotifications();
    }

    const intervalId = setInterval(
      () => {
        fetchUserNotifications();
      },
      1 * 60 * 1000,
    );

    return () => clearInterval(intervalId);
  }, [fetchUserNotifications, user]);

  const contextValue: NotificationsContextValue = {
    userNotifications,
    fetchUserNotifications,
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};
