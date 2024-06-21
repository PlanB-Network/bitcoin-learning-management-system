import {
  createCalculateCourseChapterSeats,
  createCalculateEventSeats,
  createGetNow,
  createProcessChangedFiles,
  createProcessDeleteOldEntities,
  createSyncEventsLocations,
} from '@sovereign-university/content';
import {
  createGetAllRepoFiles,
  createSyncCdnRepository,
} from '@sovereign-university/github';

import type { Dependencies } from '#src/dependencies.js';

export function createSyncGithubRepositories(dependencies: Dependencies) {
  const {
    config: { sync: config },
  } = dependencies;

  const getNow = createGetNow(dependencies);
  const getAllRepoFiles = createGetAllRepoFiles(config);
  const syncCdnRepository = createSyncCdnRepository(config);
  const calculateCourseChapterSeats =
    createCalculateCourseChapterSeats(dependencies);
  const calculateEventSeats = createCalculateEventSeats(dependencies);
  const syncEventsLocations = createSyncEventsLocations(dependencies);
  const processChangedFiles = createProcessChangedFiles(dependencies);
  const processDeleteOldEntities = createProcessDeleteOldEntities(dependencies);

  return async () => {
    const databaseTime = await getNow();
    if (!databaseTime) {
      return { success: false };
    }

    console.time('-- Sync procedure');
    console.log('-- Sync procedure: START ===================================');

    if (!config.publicRepositoryUrl) {
      throw new Error('DATA_REPOSITORY_URL is not defined');
    }

    const timeKeyGetAllRepoFiles = '-- Sync procedure: Get all repo files';
    console.log(timeKeyGetAllRepoFiles + '...');
    console.time(timeKeyGetAllRepoFiles);
    const syncErrors = await getAllRepoFiles().then(processChangedFiles);
    console.timeEnd(timeKeyGetAllRepoFiles);

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

    let privateCdnError;
    if (config.privateRepositoryUrl && config.githubAccessToken) {
      const timeKeySync = '-- Sync procedure: Syncing private CDN repository';
      console.log(timeKeySync + '...');
      console.time(timeKeySync);
      try {
        await syncCdnRepository(config.privateRepositoryUrl);
      } catch (error) {
        console.error(error);
        privateCdnError =
          error instanceof Error ? error.message : new Error('Unknown error');
      }
      console.timeEnd(timeKeySync);
    }

    let publicCdnError;
    {
      const timeKeySyncCdn = '-- Sync procedure: Syncing public CDN repository';
      console.log(timeKeySyncCdn + '...');
      console.time(timeKeySyncCdn);
      try {
        await syncCdnRepository(config.publicRepositoryUrl);
      } catch (error) {
        console.error(error);
        publicCdnError =
          error instanceof Error ? error.message : new Error('Unknown error');
      }
      console.timeEnd(timeKeySyncCdn);
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
