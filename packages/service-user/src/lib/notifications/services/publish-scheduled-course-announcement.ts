import type { Dependencies } from '#src/dependencies.js';
import { publishScheduledCourseAnnouncementQuery } from '../queries/publish-scheduled-course-announcement.js';

export const createPublishScheduledCourseAnnouncement = ({
  postgres,
}: Dependencies) => {
  return async ({
    scheduledAnnouncementId,
  }: {
    scheduledAnnouncementId: string;
  }) => {
    console.log(
      `Publishing scheduled course announcement with ID: ${scheduledAnnouncementId}`,
    );

    // TODO: handle getting users with specific group, right now we get every users enlisted in the course
    const result = await postgres.exec(
      publishScheduledCourseAnnouncementQuery({ scheduledAnnouncementId }),
    );

    if (result && result.length > 0) {
      return result[0];
    }

    return null;
  };
};
