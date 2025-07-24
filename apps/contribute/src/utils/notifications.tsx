import { NotificationType } from '@blms/constants';
import { cn } from '@blms/ui';
import { t } from 'i18next';
import { AiOutlineTrophy, AiOutlineWarning } from 'react-icons/ai';
import { BiBookBookmark } from 'react-icons/bi';
import { IoMegaphoneOutline } from 'react-icons/io5';
import { LuCalendarDays, LuStar } from 'react-icons/lu';
import { MdAccessAlarm } from 'react-icons/md';

export const isTeacherAnnouncementType = (type: string) => {
  return [
    NotificationType.General,
    NotificationType.Assignment,
    NotificationType.Warning,
    NotificationType.Celebration,
  ].includes(type as NotificationType);
};

export const getNotificationIcon = (type: string, className?: string) => {
  const classes = cn(className ? className : 'size-[18px] md:size-6');

  switch (type) {
    case NotificationType.Calendar24HoursCourse:
    case NotificationType.Calendar48HoursOnlineEvent:
    case NotificationType.Calendar24HoursInPersonEvent:
      return <LuCalendarDays className={classes} />;
    case NotificationType.Calendar:
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
    case NotificationType.Assignment:
    case NotificationType.Calendar:
    case NotificationType.Celebration:
    case NotificationType.Warning:
    case NotificationType.General:
      return `/courses/${courseId}`;
    default:
      return '/';
  }
};

export const getNotificationTitle = (type: string, courseId?: string) => {
  switch (type) {
    case NotificationType.Calendar24HoursCourse:
    case NotificationType.Calendar5MinutesCourse:
      return t('notifications.course');
    case NotificationType.Calendar48HoursOnlineEvent:
    case NotificationType.Calendar24HoursInPersonEvent:
    case NotificationType.Calendar5MinutesOnlineEvent:
      return t('notifications.event');
    case NotificationType.Blog:
      return t('notifications.blog');
    case NotificationType.Assignment:
      return t('notifications.assignment');
    case NotificationType.Calendar:
      return t('notifications.calendar');
    case NotificationType.Celebration:
      return t('notifications.celebration');
    case NotificationType.Results:
      return t('notifications.results');
    case NotificationType.Warning:
      return t('notifications.warning');
    case NotificationType.General:
      return t('notifications.general');
    default:
      return t('notifications.notification');
  }
};

export const getNotificationContent = (
  type: string,
  chapterId?: string,
  eventId?: string,
  blogId?: string,
) => {
  switch (type) {
    case NotificationType.Calendar24HoursCourse:
      return t('notifications.courseStarting24h');
    case NotificationType.Calendar5MinutesCourse:
      return t('notifications.courseStarting5min');
    case NotificationType.Calendar48HoursOnlineEvent:
      return t('notifications.eventStarting48h');
    case NotificationType.Calendar24HoursInPersonEvent:
      return t('notifications.eventStarting24h');
    case NotificationType.Calendar5MinutesOnlineEvent:
      return t('notifications.eventStarting5min');
    case NotificationType.Blog:
      return t('notifications.newBlogPost');
    case NotificationType.Assignment:
      return t('notifications.newAssignment');
    case NotificationType.Calendar:
      return t('notifications.calendarReminder');
    case NotificationType.Celebration:
      return t('notifications.celebration');
    case NotificationType.Results:
      return t('notifications.resultsAvailable');
    case NotificationType.Warning:
      return t('notifications.warning');
    case NotificationType.General:
      return t('notifications.generalAnnouncement');
    default:
      return t('notifications.newNotification');
  }
};
