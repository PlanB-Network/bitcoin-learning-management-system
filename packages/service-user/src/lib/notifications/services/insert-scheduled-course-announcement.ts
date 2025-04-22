import type { NotificationType } from '@blms/constants';
import { firstRow } from '@blms/database';
import type { Dependencies } from '#src/dependencies.js';
import { getUserByIdQuery } from '../../account/queries/get-user.js';
import { insertScheduledCourseAnnouncementQuery } from '../queries/insert-scheduled-course-announcement.js';

interface Options {
  type: NotificationType;
  content: string;
  scheduledAt: Date;
  timezone: string;
  studentGroup: 'all' | 'summer' | 'assignment';
  courseId: string;
  uid: string;
}

export const createInsertScheduledCourseAnnouncement = ({
  postgres,
}: Dependencies) => {
  return async (options: Options) => {
    const user = await postgres
      .exec(getUserByIdQuery(options.uid))
      .then(firstRow);

    if (!user || !user.professorId) {
      throw new Error('User not found or not a professor.');
    }

    // TODO : Maybe we should check if the professorId is authorized to send announcements for this course ?

    const scheduledAnnouncementResult = await postgres.exec(
      insertScheduledCourseAnnouncementQuery({
        ...options,
        professorId: user.professorId,
      }),
    );

    if (
      !scheduledAnnouncementResult ||
      scheduledAnnouncementResult.length === 0 ||
      !scheduledAnnouncementResult[0].id
    ) {
      throw new Error('Failed to insert the scheduled course announcement.');
    }

    return scheduledAnnouncementResult[0].id;
  };
};
