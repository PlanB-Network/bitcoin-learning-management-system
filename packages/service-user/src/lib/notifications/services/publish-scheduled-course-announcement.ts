import type { Dependencies } from '#src/dependencies.js';
import { createSendCourseAnnouncementEmail } from '../../courses/services/send-course-announcement-email.js';
import { publishScheduledCourseAnnouncementQuery } from '../queries/publish-scheduled-course-announcement.js';

export const createPublishScheduledCourseAnnouncement = (
  dependencies: Dependencies,
) => {
  const { postgres } = dependencies;

  return async ({
    scheduledAnnouncementId,
  }: {
    scheduledAnnouncementId: string;
  }) => {
    console.log(
      `Publishing scheduled course announcement with ID: ${scheduledAnnouncementId}`,
    );

    // TODO: handle summer school selected students
    const result = await postgres.exec(
      publishScheduledCourseAnnouncementQuery({ scheduledAnnouncementId }),
    );

    if (result && result.length > 0) {
      console.log(
        `Scheduled course announcement with ID: ${scheduledAnnouncementId} published successfully. Sending related emails...`,
      );
      createSendCourseAnnouncementEmail(dependencies)({
        announcementId: result[0].id,
      });
    }

    return null;
  };
};
