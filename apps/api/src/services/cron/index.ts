import { createExamTimestampService } from '@blms/service-user';

import type { Dependencies } from '#src/dependencies.js';

export const registerCronTasks = async (ctx: Dependencies) => {
  const timestampService = await createExamTimestampService(ctx);

  if (timestampService) {
    ctx.crons.addTask('1m', () => timestampService.timestampAllExams());
    ctx.crons.addTask('1m', () => timestampService.upgradeAllTimeStamps());
    ctx.crons.addTask('1m', () => timestampService.generateAllCertificates());
  }
};
