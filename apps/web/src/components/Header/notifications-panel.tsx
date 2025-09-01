import type { JoinedUserNotification } from '@blms/types';
import { cn, Popover, PopoverContent, PopoverTrigger, TextTag } from '@blms/ui';
import { useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { useContext, useState } from 'react';
import { FaBell } from 'react-icons/fa6';
import { IoMdClose } from 'react-icons/io';
import { TbBell } from 'react-icons/tb';
import { NotificationsContext } from '#src/providers/userNotificationsContext.tsx';
import {
  getNotificationContent,
  getNotificationIcon,
  getNotificationRedirect,
  getNotificationTitle,
} from '#src/routes/$lang/dashboard/_dashboard/notifications.tsx';
import { isTeacherAnnouncementType } from '#src/utils/notifications.ts';
import { trpc } from '#src/utils/trpc.ts';

interface NotificationItemProps {
  notification: JoinedUserNotification;
  onClose?: () => void;
}

interface NotificationsPanelProps {
  className?: string;
}

export const NotificationsPanel = ({ className }: NotificationsPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { userNotifications, fetchUserNotifications } =
    useContext(NotificationsContext);

  const unreadNotifications = (
    userNotifications ? [...userNotifications] : []
  ).filter((notification) => notification.readDate === null);
  const hasUnreadNotifications = unreadNotifications.length > 0;

  const markNotificationsAsRead = useMutation(
    trpc.user.notifications.markUserNotificationsAsRead.mutationOptions({
      onSuccess: () => {
        fetchUserNotifications();
      },
    }),
  );

  const handleCloseNotification = (id: string) => {
    markNotificationsAsRead.mutate({ notificationIds: [id] });
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'max-lg:hidden group z-50 flex items-center justify-center text-sm font-semibold outline-hidden transition-all lg:gap-2.5 relative',
              className,
            )}
            aria-label="Toggle notifications panel"
          >
            <TbBell strokeWidth={1.5} className="text-newGray-1" size={24} />
            {unreadNotifications.length > 0 && (
              <div className="absolute top-0.5 right-0.5 rounded-full size-2.5 bg-orange-500" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            'absolute z-50 w-[390px] p-0 lg:rounded-[12px] h-fit max-h-[782px] overflow-y-scroll no-scrollbar top-7 -right-[50px] bg-newGray-6 border border-newGray-5 shadow-course-navigation-sm',
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-start justify-start">
            <NotificationsHeader />

            <div className="no-scrollbar w-full flex-col self-stretch">
              {unreadNotifications.slice(0, 5).map((notification, _) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClose={() => handleCloseNotification(notification.id)}
                />
              ))}
            </div>

            {unreadNotifications.length > 5 && <ViewMoreButton />}

            {!hasUnreadNotifications && (
              <p className="w-full p-4 text-center text-newBlack-1 subtitle-small-caps-14px">
                {t('notifications.noUnreadNotifications')}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Mobile - Link only */}
      <Link
        to="/dashboard/notifications"
        className={cn(
          'lg:hidden flex items-center justify-center relative',
          className,
        )}
        aria-label="View notifications"
      >
        <FaBell className="text-newBlack-1 " size={24} />
        <div className="absolute top-0 -right-0.5 rounded-full size-3.5 bg-darkOrange-2" />
      </Link>
    </>
  );
};

const NotificationItem = ({ notification, onClose }: NotificationItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const tagVariant =
    isHovered || isTeacherAnnouncementType(notification.type)
      ? 'orange'
      : 'grey';

  return (
    <div
      className={cn(
        'group flex w-full items-start self-stretch',
        isHovered && 'bg-darkOrange-0 border-l border-darkOrange-4 ',
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={getNotificationRedirect(
          notification.type,
          notification.courseId || undefined,
          notification.chapterId || undefined,
        )}
        className="flex flex-1 flex-col items-start justify-start gap-2.5 p-4"
      >
        <div className="flex w-full items-center justify-between self-stretch">
          <div className="flex items-center justify-start gap-3">
            <div className="size-6">
              {getNotificationIcon(
                notification.type,
                cn(
                  'size-full',
                  isTeacherAnnouncementType(notification.type)
                    ? 'text-darkOrange-6'
                    : 'text-newBlack-1',
                ),
              )}
            </div>
            <TextTag variant={tagVariant} mode="light100" size="verySmall">
              {getNotificationTitle(
                notification.type,
                notification.courseId || undefined,
              )}
            </TextTag>
          </div>
          <div className="size-2 rounded-full bg-darkOrange-5" />
        </div>
        <p className="self-stretch body-14px text-newBlack-1 line-clamp-6 whitespace-pre-line">
          {notification.content ||
            getNotificationContent(
              notification.type,
              notification.chapterId || undefined,
              notification.eventId || undefined,
              notification.blogId || undefined,
            )}
        </p>
      </Link>
      {onClose && (
        <div className="flex items-center justify-center gap-2.5 px-4 py-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex size-5 items-center justify-center text-newGray-1 hover:text-newGray-2"
            aria-label="Dismiss notification"
          >
            <IoMdClose className="size-full" />
          </button>
        </div>
      )}
    </div>
  );
};

const NotificationsHeader = () => {
  return (
    <div className="flex w-full items-center justify-between self-stretch px-5 py-2 border-b border-newGray-4">
      <h3 className="flex subtitle-large-18px text-newBlack-5">
        {t('notifications.notifications')}
      </h3>
      <Link
        to="/dashboard/notifications"
        className="flex items-center justify-center gap-2.5 overflow-hidden rounded-lg px-2.5 text-base font-normal text-newBlack-5 hover:text-darkOrange-5 underline"
      >
        {t('home.blogSection.seeAll')}
      </Link>
    </div>
  );
};

const ViewMoreButton = () => {
  return (
    <Link
      to="/dashboard/notifications"
      className="flex w-full items-center px-4 py-3 text-base font-normal text-newBlack-5 hover:text-darkOrange-5 underline border-t border-newGray-4"
    >
      {t('words.viewMore')}
    </Link>
  );
};
