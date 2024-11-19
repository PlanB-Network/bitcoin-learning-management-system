import { createRefreshCoursesRatings } from '@blms/service-content';
import {
  createExamTimestampService,
  createMigrateUserFiles,
} from '@blms/service-user';

import type { Dependencies } from '#src/dependencies.js';

export const registerCronTasks = async (ctx: Dependencies) => {
  const timestampService = await createExamTimestampService(ctx);
  const refreshCoursesRatings = createRefreshCoursesRatings(ctx);

  if (timestampService) {
    // Every five minutes
    ctx.crons.addTask('5m', () => refreshCoursesRatings());
    ctx.crons.addTask('5m', () => timestampService.timestampAllExams());
    ctx.crons.addTask('5m', () => timestampService.upgradeAllTimeStamps());
    ctx.crons.addTask('5m', () => timestampService.validateAllTimeStamps());
    ctx.crons.addTask('5m', () => timestampService.generateAllCertificates());
    ctx.crons.addTask('5m', () => timestampService.generateAllThumbnails());
  }

  // Execute once
  {
    const migrateUserFiles = createMigrateUserFiles(ctx);
    queueMicrotask(() => migrateUserFiles());
  }
};
