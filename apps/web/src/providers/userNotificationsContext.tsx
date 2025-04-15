import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';

import type { JoinedUserNotification } from '@blms/types';

import { trpcClient } from '#src/utils/trpc.js';
interface NotificationsContextValue {
  userNotifications: JoinedUserNotification[];
  fetchUserNotifications: () => Promise<void>;
}

export const NotificationsContext = createContext<NotificationsContextValue>({
  userNotifications: [],
  fetchUserNotifications: async () => {},
});

export const NotificationsProvider = ({ children }: PropsWithChildren) => {
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
    fetchUserNotifications();

    const intervalId = setInterval(
      () => {
        fetchUserNotifications();
      },
      1 * 60 * 1000,
    );

    return () => clearInterval(intervalId);
  }, [fetchUserNotifications]);

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
