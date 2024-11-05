import type { Router } from 'express';

import { createGetEventList, createGetEventUsers } from '@blms/service-user';

import type { Dependencies } from '#src/dependencies.js';
import { createApiKeyMiddleware } from '#src/middlewares/auth.js';

export const createRestEventRoutes = (
  dependencies: Dependencies,
  router: Router,
) => {
  const apiKeyAuth = createApiKeyMiddleware(dependencies);

  const getEventList = createGetEventList(dependencies);
  router.get('/events', apiKeyAuth, async (_req, res) => {
    res.json(await getEventList());
  });

  const getEventMembers = createGetEventUsers(dependencies);
  router.get('/event/:eventId', apiKeyAuth, async (req, res) => {
    res.json(await getEventMembers({ eventId: req.params.eventId }));
  });
};
