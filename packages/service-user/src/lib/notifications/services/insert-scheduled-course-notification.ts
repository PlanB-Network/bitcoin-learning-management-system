// import type { NotificationType } from '@blms/constants';
// import type { Dependencies } from '#src/dependencies.js';
// import { getExistingNotificationsQuery } from '../queries/get-existing-notifications.js';
// import { insertUserNotificationsQuery } from '../queries/insert-user-notifications.js';

// interface Options {
//   type: NotificationType;
//   content: string;
//   scheduledAt: Date;
//   timezone: string;
//   studentGroup: 'all' | 'summer' | 'assignment';
//   courseId: string;
//   professorId: string;
// }

// INSERT SCHEDULED COURSE NOTIFICATION -> must create the userNotification first, get ID back and then insert the scheduled course notification

// export const createInsertScheduledCourseNotification = ({ postgres }: Dependencies) => {
//   return async ({
//   }: Options) => {
//     const existingNotification = await postgres.exec(
//       getExistingNotificationsQuery(type, chapterId, eventId, blogId),
//     );
//     if (existingNotification.length > 0) {
//       return;
//     }

//     await postgres.exec(
//       insertUserNotificationsQuery({
//         uids,
//         type,
//         content,
//         courseId,
//         chapterId,
//         eventId,
//         blogId,
//       }),
//     );
//   };
// };

// PUBLISH NOTIFICATION (will be handled with a cron job) -> should get the uids of the selected users (take group into account), add it to their userNotificationStatus using the notificationId, and then updating the scheduled course notification to set isPublished to true

//  BELOW -> just for reference

// // export const usersScheduledCourseNotifications = users.table(
// //   'scheduled_course_notifications',
// //   (t) => ({
// //     id: t.uuid().primaryKey().defaultRandom(),
// //     notificationId: t
// //       .uuid()
// //       .notNull()
// //       .references(() => usersNotifications.id, { onDelete: 'set null' }),
// //     professorId: t
// //       .uuid()
// //       .notNull()
// //       .references(() => contentProfessors.id, { onDelete: 'cascade' }),
// //     courseId: t
// //       .varchar({ length: 100 })
// //       .notNull()
// //       .references(() => contentCourses.id, {
// //         onDelete: 'cascade',
// //       }),
// //     studentGroup: t.varchar({ length: 50 }).notNull(),
// //     content: t.text().notNull(),
// //     type: notificationTypeEnum().notNull(),
// //     scheduledAt: t.timestamp({ withTimezone: true }).notNull(),
// //     timezone: t.varchar({ length: 50 }).notNull(),
// //     isPublished: t.boolean().default(false).notNull(),
// //     createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
// //     updatedAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
// //   }),
// // );
