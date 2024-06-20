/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  createCalculateCourseChapterSeats,
  createCalculateEventSeats,
  createGetNow,
  createProcessChangedFiles,
  createProcessDeleteOldEntities,
  createSyncEventsLocations,
} from '@sovereign-university/content';
import {
  computeTemporaryDirectory,
  getAllRepoFiles,
  syncCdnRepository,
} from '@sovereign-university/github';

import type { Dependencies } from '#src/dependencies.js';

export async function syncGithubRepositories(dependencies: Dependencies) {
  const databaseTime = await createGetNow(dependencies)();

  if (!databaseTime) {
    return { success: false };
  }

  console.log('-- Sync procedure: START ====================================');

  const processChangedFiles = createProcessChangedFiles(dependencies);
  const processDeleteOldEntities = createProcessDeleteOldEntities(dependencies);

  if (!process.env['DATA_REPOSITORY_URL']) {
    throw new Error('DATA_REPOSITORY_URL is not defined');
  }

  const syncErrors = await getAllRepoFiles(
    process.env['DATA_REPOSITORY_URL'],
    process.env['DATA_REPOSITORY_BRANCH'],
    process.env['PRIVATE_DATA_REPOSITORY_URL'],
    process.env['PRIVATE_DATA_REPOSITORY_BRANCH'],
    process.env['GITHUB_ACCESS_TOKEN'],
  ).then(processChangedFiles);

  console.log('-- Sync procedure: Calculate remaining seats');
  await createCalculateCourseChapterSeats(dependencies)();
  await createCalculateEventSeats(dependencies)();
  await createSyncEventsLocations(dependencies)().catch((error) =>
    console.error('-- Sync procedure: Error fetching event locations:', error),
  );

  if (syncErrors.length === 0) {
    await processDeleteOldEntities(databaseTime.now, syncErrors);
  }

  if (syncErrors.length > 0) {
    console.error(
      `=== ${syncErrors.length} ERRORS occurred during the sync process: `,
    );
    console.error(syncErrors.join('\n'));
  }

  let privateCdnError;
  if (
    process.env['PRIVATE_DATA_REPOSITORY_URL'] &&
    process.env['GITHUB_ACCESS_TOKEN']
  ) {
    try {
      await syncCdnRepository(
        computeTemporaryDirectory(process.env['PRIVATE_DATA_REPOSITORY_URL']),
        process.env['CDN_PATH'] || '/tmp/cdn',
      );
    } catch (error) {
      console.error(error);
      privateCdnError =
        error instanceof Error ? error.message : new Error('Unknown error');
    }
  }

  let publicCdnError;
  try {
    await syncCdnRepository(
      computeTemporaryDirectory(process.env['DATA_REPOSITORY_URL']),
      process.env['CDN_PATH'] || '/tmp/cdn',
    );
  } catch (error) {
    console.error(error);
    publicCdnError =
      error instanceof Error ? error.message : new Error('Unknown error');
  }

  console.log('-- Sync procedure: END ====================================');

  return {
    success: syncErrors.length === 0,
    syncErrors: syncErrors.length > 0 ? syncErrors : undefined,
    publicCdnError: publicCdnError,
    privateCdnError: privateCdnError,
  };
}
