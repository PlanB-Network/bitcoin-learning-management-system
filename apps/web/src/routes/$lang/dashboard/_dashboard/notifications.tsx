import { NotificationType } from '@blms/constants';
import type { JoinedUserNotification } from '@blms/types';
import { Button, Checkbox, Label, Loader, Switch, TextTag, cn } from '@blms/ui';
import { Link, createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineTrophy, AiOutlineWarning } from 'react-icons/ai';
import { BiBookBookmark } from 'react-icons/bi';
import { IoMailOpenSharp, IoMegaphoneOutline } from 'react-icons/io5';
import { LuCalendarDays, LuStar } from 'react-icons/lu';
import { MdAccessAlarm } from 'react-icons/md';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.tsx';
import { NotificationsContext } from '#src/providers/userNotificationsContext.tsx';
import { formatDate, getTimeString } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/notifications',
)({
  component: NotificationsDashboard,
});

function NotificationsDashboard() {
  return (
    <>
      <h1 className="title-large-24px md:display-small-32px text-dashboardSectionText max-md:px-4">
        {t('notifications.notifications')}
      </h1>

      <h2 className="mobile-h3 md:subtitle-large-med-20px text-newBlack-1 mt-5 md:mt-8 max-md:px-4">
        {t('notifications.stayUpToDate')}
      </h2>

      <p className="desktop-typo1 md:body-16px text-newBlack-1 mt-2.5 md:mt-4 max-md:px-4">
        {t('notifications.dashboardDescription')}
      </p>

      <NotificationsTable />
    </>
  );
}

const NotificationsTable = () => {
  const isMobile = useSmaller('md');

  const { userNotifications, fetchUserNotifications } =
    useContext(NotificationsContext);

  const markNotificationsAsRead =
    trpc.user.notifications.markUserNotificationsAsRead.useMutation({
      onSuccess: () => {
        fetchUserNotifications();
      },
    });

  const [notifications, setNotifications] = useState<JoinedUserNotification[]>(
    [],
  );

  const [maxNotificationsShown, setMaxNotificationsShown] = useState(10);

  const [selectedNotifications, setSelectedNotifications] = useState<
    { id: string }[]
  >([]);
  const [hoveredNotification, setHoveredNotification] = useState<string | null>(
    null,
  );

  const [isInSelectAllMode, setIsInSelectAllMode] = useState(false);
  const [isUnreadOnly, setIsUnreadOnly] = useState(false);

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications((prev) => {
      const isSelected = prev.some((notification) => notification.id === id);
      if (isSelected) {
        return prev.filter((notification) => notification.id !== id);
      }
      return [...prev, { id }];
    });
  };

  const handleSelectAllNotifications = () => {
    if (selectedNotifications.length > 0) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(
        shownNotifications.map((notification) => ({ id: notification.id })),
      );
    }
  };

  const handleMarkSelectedAsRead = () => {
    if (selectedNotifications.length > 0) {
      markNotificationsAsRead.mutate({
        notificationIds: selectedNotifications.map(
          (notification) => notification.id,
        ),
      });
    }
    setSelectedNotifications([]);
    setIsInSelectAllMode(false);
  };

  const handleMarkAsRead = (id: string) => {
    markNotificationsAsRead.mutate({ notificationIds: [id] });
  };

  const shownNotifications = notifications
    .filter((notification) => !isUnreadOnly || notification.readDate === null)
    .slice(0, maxNotificationsShown);

  useEffect(() => {
    if (userNotifications) {
      setNotifications(
        [...userNotifications]?.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    }
  }, [userNotifications]);

  if (userNotifications && userNotifications.length === 0) {
    return (
      <p className="mt-8 subtitle-small-caps-14px text-newGray-1">
        {t('notifications.noRecentNotifications')}
      </p>
    );
  }

  return (
    <div className="flex flex-col mt-5 md:mt-8 w-full max-w-[996px]">
      {!userNotifications ? (
        <Loader size={'s'} />
      ) : (
        <>
          <div className="flex max-md:flex-wrap w-full justify-between items-center gap-2.5 md:gap-4 max-md:px-4">
            {isMobile && !isInSelectAllMode && (
              <Button
                variant="tertiary"
                mode="light"
                size={'xs'}
                className="w-fit"
                onClick={() => setIsInSelectAllMode(true)}
              >
                {t('notifications.select')}
              </Button>
            )}
            {(!isMobile || isInSelectAllMode) && (
              <MultiSelectionTool
                selectedIds={selectedNotifications}
                handleSelectAll={handleSelectAllNotifications}
                handleAction={handleMarkSelectedAsRead}
                selectedAmount={selectedNotifications.length}
              />
            )}
            <div className="flex gap-2 md:gap-2.5 items-center md:px-1">
              <span className="text-black body-14px md:label-medium-16px">
                {t('words.all')}
              </span>
              <Switch
                checked={isUnreadOnly}
                onCheckedChange={() => {
                  setIsUnreadOnly((prev) => !prev);
                  setMaxNotificationsShown(10);
                }}
                size={isMobile ? 'xs' : 's'}
                mode="light"
              />
              <span className="text-black body-14px md:label-medium-16px">
                {t('notifications.unread')}
              </span>
            </div>
          </div>

          <section className="flex flex-col w-full md:rounded-[12px] border border-newGray-5 mt-5 overflow-hidden">
            {shownNotifications.map(
              (notification, index, filteredNotifications) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  index={index}
                  filteredNotifications={filteredNotifications}
                  selectedNotifications={selectedNotifications}
                  hoveredNotification={hoveredNotification}
                  setHoveredNotification={setHoveredNotification}
                  setSelectedNotifications={setSelectedNotifications}
                  handleSelectNotification={handleSelectNotification}
                  handleMarkAsRead={handleMarkAsRead}
                  isMobile={isMobile}
                  isInSelectAllMode={isInSelectAllMode}
                />
              ),
            )}
          </section>

          {shownNotifications.length <= maxNotificationsShown &&
            shownNotifications.length <
              notifications.filter(
                (notification) =>
                  !isUnreadOnly || notification.readDate === null,
              ).length && (
              <Button
                variant="secondary"
                mode="light"
                size={isMobile ? 's' : 'm'}
                className="mt-5 md:mt-8 w-fit max-md:mx-auto"
                onClick={() => setMaxNotificationsShown((prev) => prev + 10)}
              >
                {t('words.viewMore')}
              </Button>
            )}
        </>
      )}
    </div>
  );
};

const NotificationItem = ({
  notification,
  index,
  filteredNotifications,
  selectedNotifications,
  hoveredNotification,
  setHoveredNotification,
  handleSelectNotification,
  handleMarkAsRead,
  isMobile,
  isInSelectAllMode,
}: {
  notification: JoinedUserNotification;
  index: number;
  filteredNotifications: JoinedUserNotification[];
  selectedNotifications: { id: string }[];
  hoveredNotification: string | null;
  setSelectedNotifications: React.Dispatch<
    React.SetStateAction<{ id: string }[]>
  >;
  setHoveredNotification: React.Dispatch<React.SetStateAction<string | null>>;
  handleSelectNotification: (id: string) => void;
  handleMarkAsRead: (id: string) => void;
  isMobile?: boolean | null;
  isInSelectAllMode?: boolean;
}) => {
  const [hasTriggered, setHasTriggered] = useState(false);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);
  const [hasDeterminedDirection, setHasDeterminedDirection] = useState(false);

  const MAX_SWIPE = 73;
  const TRIGGER_SWIPE = 73;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsHorizontalSwipe(false);
    setHasDeterminedDirection(false);
    setHasTriggered(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStartX;
    const deltaY = e.touches[0].clientY - touchStartY;

    if (!hasDeterminedDirection) {
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        setIsHorizontalSwipe(Math.abs(deltaX) > Math.abs(deltaY));
        setHasDeterminedDirection(true);
      }
      return;
    }

    if (!isHorizontalSwipe) return;

    const swipeDistance = -deltaX;
    if (swipeDistance > 0) {
      setTouchDeltaX(Math.min(swipeDistance, MAX_SWIPE));

      if (swipeDistance >= TRIGGER_SWIPE && !hasTriggered) {
        setHasTriggered(true);
        handleMarkAsRead(notification.id);

        setTimeout(() => {
          setTouchDeltaX(0);
        }, 800);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isHorizontalSwipe && !hasTriggered) {
      setTimeout(() => {
        setTouchDeltaX(0);
      }, 150);
    }
    setIsHorizontalSwipe(false);
    setHasDeterminedDirection(false);
  };

  const isRead = notification.readDate !== null;

  return (
    <div
      key={notification.id}
      className="relative flex flex-col touch-pan-x touch-pan-y"
    >
      {isMobile && (
        <div
          className="absolute w-[73px] top-0 right-0 bottom-0 flex flex-col gap-1.5 items-center justify-center px-4 bg-darkOrange-5 text-white z-20 pointer-events-none transition-transform"
          style={{
            transform: `translateX(${MAX_SWIPE - touchDeltaX}px)`,
          }}
        >
          <IoMailOpenSharp size={24} />
          <span>{t('notifications.read')}</span>
        </div>
      )}
      <article
        className={cn(
          'group flex w-full md:hover:bg-darkOrange-0 hover:border-darkOrange-4 md:hover:border-l-2 py-1.5 px-4 md:p-4',
          isRead && 'bg-transparent/5',
        )}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
        onMouseEnter={() => setHoveredNotification(notification.id)}
        onMouseLeave={() => setHoveredNotification(null)}
      >
        {(!isMobile || isInSelectAllMode) && (
          <div className="flex items-start max-md:pt-3 max-md:px-1 md:py-1">
            <Checkbox
              id={notification.id}
              checked={selectedNotifications.some(
                (selected) => selected.id === notification.id,
              )}
              onCheckedChange={() => handleSelectNotification(notification.id)}
              size={isMobile ? 's' : 'm'}
            />
          </div>
        )}
        <Link
          to={getNotificationRedirect(
            notification.type,
            notification.courseId ?? undefined,
            notification.chapterId ?? undefined,
            notification.eventId ?? undefined,
            notification.blogId ?? undefined,
          )}
          className="flex flex-col gap-2.5 md:px-4 grow"
        >
          <div className="flex justify-between items-center max-md:min-h-8">
            <div className="flex items-center gap-2 md:gap-3">
              {!isRead && (
                <div className="rounded-full size-2 bg-darkOrange-5 md:hidden ml-1.5" />
              )}
              {getNotificationIcon(notification.type)}
              <TextTag
                size="verySmall"
                variant={
                  !isMobile && notification.id === hoveredNotification
                    ? 'orange'
                    : 'grey'
                }
                mode={
                  !isMobile && notification.id === hoveredNotification
                    ? 'light100'
                    : 'light'
                }
              >
                {getNotificationTitle(
                  notification.type,
                  notification.courseId || undefined,
                )}
              </TextTag>
            </div>
            {!isRead && (
              <div className="rounded-full size-2 bg-darkOrange-5 max-md:hidden" />
            )}
            <span className="px-4 shrink-0 text-center lowercase desktop-caption1 text-newBlack-5 md:hidden">
              {getNotificationDateString(new Date(notification.createdAt))}
            </span>
          </div>
          <p className="body-14px text-newBlack-1">
            {notification.content ||
              getNotificationContent(
                notification.type,
                notification.chapterId ?? undefined,
                notification.eventId ?? undefined,
                notification.blogId ?? undefined,
              )}
          </p>
        </Link>
        <span className="px-4 w-[140px] shrink-0 text-center lowercase desktop-caption1 text-newBlack-5 max-md:hidden">
          {getNotificationDateString(new Date(notification.createdAt))}
        </span>
      </article>
      {index < filteredNotifications.length - 1 && (
        <div className="h-px w-full bg-newGray-4" />
      )}
    </div>
  );
};

const MultiSelectionTool = ({
  selectedIds,
  handleSelectAll,
  handleAction,
  selectedAmount,
}: {
  selectedIds: { id: string }[];
  handleSelectAll: () => void;
  handleAction?: () => void;
  selectedAmount?: number;
}) => {
  const isMobile = useSmaller('md');

  return (
    <div className="flex gap-4 items-center">
      <Label className="flex items-center gap-4 md:px-4 self-stretch">
        <Checkbox
          id="select-all"
          checked={selectedIds.length > 0}
          onCheckedChange={handleSelectAll}
          size={isMobile ? 's' : 'm'}
        />
        <span className="text-newBlack-1 subtitle-small-med-14px max-md:leading-[14px] md:subtitle-medium-med-16px">
          {selectedAmount && selectedAmount > 0
            ? t('words.selectedAmount', { amount: selectedAmount })
            : t('notifications.selectAll')}
        </span>
      </Label>
      <div className="w-px bg-newGray-1 self-stretch" />
      <Button
        variant="tertiary"
        mode="light"
        size={isMobile ? 'xs' : 's'}
        onClick={handleAction}
        disabled={!selectedIds.length}
      >
        {t('notifications.markAsRead')}
      </Button>
    </div>
  );
};

export const getNotificationTitle = (type: string, courseId?: string) => {
  const { courses } = useContext(AppContext);
  const courseName = courses?.find((course) => course.id === courseId)?.name;

  switch (type) {
    case NotificationType.Calendar24HoursCourse:
    case NotificationType.Calendar5MinutesCourse:
      return courseName;
    case NotificationType.Calendar48HoursOnlineEvent:
    case NotificationType.Calendar24HoursInPersonEvent:
    case NotificationType.Calendar5MinutesOnlineEvent:
      return t('notifications.upcomingEvent');
    case NotificationType.Blog:
      return t('notifications.planBNews');
    case NotificationType.Results:
      return t('notifications.bCertResults');
    default:
      return 'Notification';
  }
};

export const getNotificationContent = (
  type: string,
  chapterId?: string,
  eventId?: string,
  blogId?: string,
) => {
  const { i18n } = useTranslation();

  const { data: chapter } = trpc.content.getCourseChapter.useQuery(
    { language: i18n.language, chapterId: chapterId ?? '' },
    {
      enabled: !!chapterId,
    },
  );

  const { data: event } = trpc.content.getEvent.useQuery(
    { id: eventId ?? '' },
    {
      enabled: !!eventId,
    },
  );

  const blog = useContext(AppContext).blogs?.find((blog) => blog.id === blogId);
  if (blogId && !blog) {
    return t('notifications.blogNotTranslated');
  }

  switch (type) {
    case NotificationType.Calendar24HoursCourse: {
      const isInPerson = chapter?.isInPerson;

      return `${t('notifications.calendar_24h', {
        formattedTime:
          chapter?.startDate &&
          getTimeString(
            chapter?.startDate,
            chapter?.endDate ?? undefined,
            chapter?.timezone ?? undefined,
          ),
      })} ${isInPerson ? t('notifications.bookYourSeat') : ''}`;
    }
    case NotificationType.Calendar5MinutesCourse:
      return t('notifications.calendar_5m');
    case NotificationType.Calendar48HoursOnlineEvent:
      return t('notifications.calendar_48h_online_event', {
        formattedTime:
          event?.startDate &&
          getTimeString(
            event?.startDate,
            event?.endDate ?? undefined,
            event?.timezone ?? undefined,
          ),
        date:
          event?.startDate &&
          formatDate(
            event?.startDate,
            event.timezone ?? undefined,
            true,
            false,
          ),
        eventName: event?.name,
      });
    case NotificationType.Calendar24HoursInPersonEvent:
      return t('notifications.calendar_24h_in_person_event', {
        formattedTime:
          event?.startDate &&
          getTimeString(
            event?.startDate,
            event?.endDate ?? undefined,
            event?.timezone ?? undefined,
          ),
        eventName: event?.name,
        adressLine: event?.addressLine1,
      });
    case NotificationType.Calendar5MinutesOnlineEvent:
      return t('notifications.calendar_5m_online_event', {
        eventName: event?.name,
      });
    case NotificationType.Results:
      return t('notifications.results');
    case NotificationType.Blog:
      return blog?.title;
    default:
      return null;
  }
};

export const getNotificationIcon = (type: string, className?: string) => {
  const classes = cn(className ? className : 'size-[18px] md:size-6');

  switch (type) {
    case NotificationType.Calendar:
    case NotificationType.Calendar24HoursCourse:
    case NotificationType.Calendar48HoursOnlineEvent:
    case NotificationType.Calendar24HoursInPersonEvent:
      return <LuCalendarDays className={classes} />;
    case NotificationType.Calendar5MinutesCourse:
    case NotificationType.Calendar5MinutesOnlineEvent:
      return <MdAccessAlarm className={classes} />;
    case NotificationType.General:
    case NotificationType.Blog:
      return <IoMegaphoneOutline className={classes} />;
    case NotificationType.Assignment:
      return <BiBookBookmark className={classes} />;
    case NotificationType.Celebration:
      return <LuStar className={classes} />;
    case NotificationType.Results:
      return <AiOutlineTrophy className={classes} />;
    case NotificationType.Warning:
      return <AiOutlineWarning className={classes} />;
    default:
      return null;
  }
};

export const getNotificationRedirect = (
  type: string,
  courseId?: string,
  chapterId?: string,
  eventId?: string,
  blogId?: string,
) => {
  switch (type) {
    case NotificationType.Calendar24HoursCourse:
    case NotificationType.Calendar5MinutesCourse:
      return `/courses/${courseId}/${chapterId}`;
    case NotificationType.Calendar48HoursOnlineEvent:
    case NotificationType.Calendar24HoursInPersonEvent:
    case NotificationType.Calendar5MinutesOnlineEvent:
      return '/events/';
    case NotificationType.Blog:
      return '/public-communication/';
    default:
      return '/dashboard/notifications';
  }
};

const getNotificationDateString = (date: Date) => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return t('notifications.today');
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return t('notifications.yesterday');
  }
  if (diffInDays < 7) {
    return t('notifications.daysAgo', { days: diffInDays });
  }
  if (diffInWeeks < 5) {
    return t('notifications.weeksAgo', {
      weeks: diffInWeeks,
      s: diffInWeeks > 1 ? 's' : '',
    });
  }
  if (diffInMonths < 12) {
    return t('notifications.monthsAgo', {
      months: diffInMonths,
      s: diffInMonths > 1 ? 's' : '',
    });
  }
  return t('notifications.yearsAgo', {
    years: diffInYears,
    s: diffInYears > 1 ? 's' : '',
  });
};
