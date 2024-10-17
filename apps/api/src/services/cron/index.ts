import { createExamTimestampService } from '@blms/service-user';

import type { Dependencies } from '#src/dependencies.js';

export const registerCronTasks = async (ctx: Dependencies) => {
  const timestampService = await createExamTimestampService(ctx);

  ctx.crons.addTask('5m', () => timestampService.timestampAllExams());
  ctx.crons.addTask('5m', () => timestampService.upgradeAllTimeStamps());
  ctx.crons.addTask('5m', () => timestampService.generateAllCertificates());
};
