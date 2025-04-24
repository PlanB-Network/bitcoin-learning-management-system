import { NotificationType } from '@blms/constants';

export const isTeacherAnnouncementType = (type: NotificationType) => {
  return (
    type === NotificationType.Assignment ||
    type === NotificationType.Calendar ||
    type === NotificationType.Warning ||
    type === NotificationType.General ||
    type === NotificationType.Celebration
  );
};
