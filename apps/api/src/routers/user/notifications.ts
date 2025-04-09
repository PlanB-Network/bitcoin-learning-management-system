// import { studentProcedure } from "#src/procedures/protected.js";
// import { Parser } from "#src/trpc/types.js";
// import { z } from "zod";

// const getNotificationsProcedure = studentProcedure
//   .input(z.void())
//   .output<Parser<JoinedNotification> | null>>(
//     joinedCareerProfileSchema.nullable(),
//   )
//   .query(({ ctx }) =>
//     createGetNotifications(ctx.dependencies)({
//       uid: ctx.user.uid,
//     }),
//   );
