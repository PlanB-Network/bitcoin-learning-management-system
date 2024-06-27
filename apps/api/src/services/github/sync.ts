import {
  createCalculateCourseChapterSeats,
  createCalculateEventSeats,
  createGetNow,
  createProcessContentFiles,
  createProcessDeleteOldEntities,
  createSyncEventsLocations,
} from '@sovereign-university/content';
import {
  createSyncCdnRepository,
  createSyncRepositories,
  timeLog,
} from '@sovereign-university/github';

import type { Dependencies } from '#src/dependencies.js';

export function createSyncGithubRepositories(dependencies: Dependencies) {
  const syncConfig = dependencies.config.sync;
  const s3Config = dependencies.config.s3;

  const getNow = createGetNow(dependencies);
  const syncRepositories = createSyncRepositories(syncConfig);
  const syncCdnRepository = createSyncCdnRepository(s3Config);
  const calculateCourseChapterSeats =
    createCalculateCourseChapterSeats(dependencies);
  const calculateEventSeats = createCalculateEventSeats(dependencies);
  const syncEventsLocations = createSyncEventsLocations(dependencies);
  const processContentFiles = createProcessContentFiles(dependencies);
  const processDeleteOldEntities = createProcessDeleteOldEntities(dependencies);

  return async () => {
    const databaseTime = await getNow();
    if (!databaseTime) {
      return { success: false };
    }

    console.time('-- Sync procedure');
    console.log('-- Sync procedure: START ===================================');

    // Should not happen as config is validated on startup. Remove ?
    if (!syncConfig.publicRepositoryUrl) {
      throw new Error('DATA_REPOSITORY_URL is not defined');
    }

    const timeGetAllRepoFiles = timeLog('Loading content files');
    const context = await syncRepositories();
    timeGetAllRepoFiles();

    console.log('-- Sync procedure: UPDATE DATABASE =========================');

    const timeProcessContentFiles = timeLog('Processing content files');
    const syncErrors = await processContentFiles(context.files);
    timeProcessContentFiles();

    console.log('-- Sync procedure: Calculate remaining seats');
    await calculateCourseChapterSeats();
    await calculateEventSeats();
    await syncEventsLocations().catch((error: Error) => console.error(error));

    if (syncErrors.length > 0) {
      console.error(
        `=== ${syncErrors.length} ERRORS occurred during the sync process: `,
      );
      console.error(syncErrors.join('\n'));
    }

    console.log('-- Sync procedure: UPDATE ASSETS ===========================');

    let privateCdnError;
    if (context.privateGit) {
      const timeSync = timeLog('Syncing private CDN repository');
      try {
        await syncCdnRepository(context.privateRepoDir, context.privateGit);
      } catch (error) {
        console.error(error);
        privateCdnError =
          error instanceof Error ? error.message : new Error('Unknown error');
      }
      timeSync();
    }

    let publicCdnError;
    {
      const timeSync = timeLog('Syncing public CDN repository');
      try {
        await syncCdnRepository(context.publicRepoDir, context.publicGit);
      } catch (error) {
        console.error(error);
        publicCdnError =
          error instanceof Error ? error.message : new Error('Unknown error');
      }
      timeSync();
    }

    console.log('-- Sync procedure: CLEAR ==================================');

    if (syncErrors.length === 0) {
      await processDeleteOldEntities(databaseTime.now, syncErrors);
    }

    console.timeEnd('-- Sync procedure');
    console.log('-- Sync procedure: END ====================================');

    return {
      success: syncErrors.length === 0,
      syncErrors: syncErrors.length > 0 ? syncErrors : undefined,
      publicCdnError: publicCdnError,
      privateCdnError: privateCdnError,
    };
  };
}
