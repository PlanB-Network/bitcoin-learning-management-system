import type { Router } from 'express';

import type { Dependencies } from '#src/dependencies.js';

import { createSyncGithubRepositories } from '../../services/github/sync.js';

export const createRestSyncRoutes = (
  dependencies: Dependencies,
  router: Router,
) => {
  const syncGithubRepositories = createSyncGithubRepositories(dependencies);

  let syncLocked = false;
  router.post('/github/sync', async (req, res): Promise<void> => {
    if (syncLocked) {
      res.status(409).json({ error: 'Already syncing' });
      return;
    } else {
      syncLocked = true;
    }

    try {
      const result = await syncGithubRepositories();
      res.json(result);
    } catch (error) {
      console.error('Failed to sync GitHub repositories:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      syncLocked = false;
    }
  });

  return router;
};
