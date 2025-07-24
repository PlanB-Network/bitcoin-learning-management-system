import {
  createSyncCdnRepository,
  createSyncRepositories,
  timeLog,
} from '@blms/github';
import {
  createCalculateCourseChapterSeats,
  createCalculateEventSeats,
  createGetNow,
  createProcessContentFiles,
  createProcessDeleteOldEntities,
  createProcessDisableOldEntities,
  createSyncEventsLocations,
  createSyncProjectsLocations,
} from '@blms/service-content';

import type { Dependencies } from '#src/dependencies.js';

export function createSyncGithubRepositories(dependencies: Dependencies) {
  const config = dependencies.config.sync;

  const getNow = createGetNow(dependencies);
  const syncRepositories = createSyncRepositories(config);
  const processContentFiles = createProcessContentFiles(dependencies);

  const calculateCourseChapterSeats =
    createCalculateCourseChapterSeats(dependencies);
  const calculateEventSeats = createCalculateEventSeats(dependencies);
  const syncEventsLocations = createSyncEventsLocations(dependencies);
  const syncProjectsLocations = createSyncProjectsLocations(dependencies);

  const syncCdnRepository = createSyncCdnRepository(config.cdnPath);
  const processDeleteOldEntities = createProcessDeleteOldEntities(dependencies);
  const processDisableOldEntities =
    createProcessDisableOldEntities(dependencies);

  return async () => {
    const databaseTime = await getNow();
    if (!databaseTime) {
      return { success: false };
    }

    console.time('[sync] Time');
    console.log('[sync] START =====---=============================');

    if (!config.publicRepositoryUrl) {
      throw new Error('DATA_REPOSITORY_URL is not defined');
    }

    const timeGetAllRepoFiles = timeLog('Loading content files');
    const context = await syncRepositories();
    timeGetAllRepoFiles();

    console.log('[sync] UPDATE DATABASE =========================');

    const syncErrors: string[] = [];
    const syncWarnings: string[] = [];

    // Process content files
    {
      const timeProcessContentFiles = timeLog('Processing content files');
      const { errors, warnings } = await processContentFiles(
        context.files,
        context.assets,
      );
      syncErrors.push(...errors);
      syncWarnings.push(...warnings);
      timeProcessContentFiles();
    }

    console.log('[sync] Calculate remaining seats');
    await calculateCourseChapterSeats();
    await calculateEventSeats();

    await syncEventsLocations(syncWarnings);

    await syncProjectsLocations(syncWarnings);

    if (syncErrors.length > 0) {
      console.error(
        `[sync] === ${syncErrors.length} ERRORS occurred during the sync process: `,
      );
      console.error(syncErrors.map((error) => `[sync] ${error}`).join('\n'));
    }

    console.log('[sync] UPDATE ASSETS ===========================');

    let privateCdnError: any;
    if (context.privateGit) {
      const timeSync = timeLog('Syncing private CDN repository');
      try {
        await syncCdnRepository(context.privateRepoDir, context.privateGit);
      } catch (error) {
        console.error('[sync]', error);
        privateCdnError =
          error instanceof Error ? error.message : new Error('Unknown error');
      }
      timeSync();
    }

    let publicCdnError: any;
    {
      const timeSync = timeLog('Syncing public CDN repository');
      try {
        await syncCdnRepository(context.publicRepoDir, context.publicGit);
      } catch (error) {
        console.error('[sync]', error);
        publicCdnError =
          error instanceof Error ? error.message : new Error('Unknown error');
      }
      timeSync();
    }

    console.log('[sync] CLEAR ==================================');

    if (syncErrors.length === 0) {
      await processDeleteOldEntities(databaseTime.now, syncErrors);
      await processDisableOldEntities(databaseTime.now, syncErrors);
    }

    console.timeEnd('[sync] Time');
    console.log('[sync] END ====================================');

    return {
      privateCdnError: privateCdnError,
      publicCdnError: publicCdnError,
      success: syncErrors.length === 0,
      syncErrors: syncErrors.length > 0 ? syncErrors : undefined,
      syncWarnings: syncWarnings.length > 0 ? syncWarnings : undefined,
    };
  };
}

export function createSyncCdnOnly(dependencies: Dependencies) {
  const config = dependencies.config.sync;
  const syncRepositories = createSyncRepositories(config);
  const syncCdnRepository = createSyncCdnRepository(config.cdnPath);

  return async () => {
    console.time('-- CDN Sync');
    console.log('-- CDN Sync: START ===============================');

    if (!config.publicRepositoryUrl) {
      throw new Error('DATA_REPOSITORY_URL is not defined');
    }

    const timeGetAllRepoFiles = timeLog('Loading repositories for assets');
    const context = await syncRepositories();
    timeGetAllRepoFiles();

    console.log('-- CDN Sync: SYNCING ASSETS ======================');

    let privateCdnError: any;
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

    let publicCdnError: any;
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

    console.timeEnd('-- CDN Sync');
    console.log('-- CDN Sync: END =================================');

    return {
      success: !publicCdnError && !privateCdnError,
      publicCdnError: publicCdnError,
      privateCdnError: privateCdnError,
    };
  };
}
