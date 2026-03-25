import {
  createAffectProjectToBizSchoolStudents,
  createSelectBizSchoolStudentsForAssignments,
} from '@blms/service-user';
import type { Router } from 'express';

import type { Dependencies } from '#src/dependencies.js';
import {
  createApiKeyMiddleware,
  noopMiddleware,
} from '#src/middlewares/auth.js';

export const createRestPlanbProgramRoutes = (
  dependencies: Dependencies,
  router: Router,
) => {
  const protectMiddleware = dependencies.config.protectSyncRoute
    ? createApiKeyMiddleware(dependencies)
    : noopMiddleware;

  const bizSchoolCourseId = 'a54c48c0-9b90-11f0-bee7-dbbaea825cda';
  const devSchoolCourseId = '0be6cfae-9d32-11f0-9601-0f79f5ccc576';

  router.post(
    '/planb-program/select-students-for-assignments',
    protectMiddleware,
    async (_req, res): Promise<void> => {
      try {
        console.log('[api] Running selectBizSchoolStudentsForAssignments job');

        const selectBizSchoolStudentsForAssignments =
          createSelectBizSchoolStudentsForAssignments(dependencies);

        await selectBizSchoolStudentsForAssignments(bizSchoolCourseId, 90);
        await selectBizSchoolStudentsForAssignments(devSchoolCourseId, 48);

        console.log('[api] Finished selectBizSchoolStudentsForAssignments job');

        res.json({ success: true });
      } catch (error) {
        console.error('Failed to select students for assignments:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  );

  router.post(
    '/planb-program/affect-project-to-students',
    protectMiddleware,
    async (_req, res): Promise<void> => {
      try {
        console.log('[api] Running affectProjectToBizSchoolStudents job');

        const affectProjectToBizSchoolStudents =
          createAffectProjectToBizSchoolStudents(dependencies);

        await affectProjectToBizSchoolStudents(bizSchoolCourseId, 6);
        await affectProjectToBizSchoolStudents(devSchoolCourseId, 6);

        console.log('[api] Finished affectProjectToBizSchoolStudents job');

        res.json({ success: true });
      } catch (error) {
        console.error('Failed to affect project to students:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  );

  return router;
};
