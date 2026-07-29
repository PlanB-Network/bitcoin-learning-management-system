import type { Router } from 'express';

import { gitSha } from '#src/config.js';
import type { Dependencies } from '#src/dependencies.js';

const startedAt = new Date().toISOString();

export const createRestVersionRoutes = (
  _dependencies: Dependencies,
  router: Router,
) => {
  // curl "localhost:3000/api/version"
  router.get('/version', (_req, res) => {
    res.json({ sha: gitSha, startedAt });
  });

  return router;
};
