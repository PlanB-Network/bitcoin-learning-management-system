import type { Dependencies } from '#src/dependencies.js';
import { deleteScheduledCourseAnnouncementQuery } from '../queries/delete-scheduled-course-announcement.js';

interface Options {
  id: string;
}

export const createDeleteScheduledCourseAnnouncement = ({
  postgres,
}: Dependencies) => {
  return async (options: Options) => {
    const deleteResult = await postgres.exec(
      deleteScheduledCourseAnnouncementQuery({
        id: options.id,
      }),
    );

    if (!deleteResult || deleteResult.length === 0) {
      throw new Error(
        `Failed to delete the scheduled course announcement. Id: ${options.id}`,
      );
    }

    return true;
  };
};
