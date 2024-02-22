import {
  createGetNow,
  createProcessChangedFiles,
  createProcessDeleteOldEntities,
} from '@sovereign-university/content';
import {
  getAllRepoFiles,
  syncCdnRepository,
} from '@sovereign-university/github';

import type { Dependencies } from '#src/dependencies.js';

export async function syncGithubRepositories(dependencies: Dependencies) {
  const { redis } = dependencies;

  const databaseTime = await createGetNow(dependencies)();

  if (!databaseTime) {
    return { success: false };
  }

  console.log('-- Sync procedure: START');

  const processChangedFiles = createProcessChangedFiles(dependencies);
  const processDeleteOldEntities = createProcessDeleteOldEntities(dependencies);

  if (!process.env['DATA_REPOSITORY_URL']) {
    throw new Error('DATA_REPOSITORY_URL is not defined');
  }

  await redis.del('trpc:*');

  console.log('-- Sync procedure: Process new repo files');

  const syncErrors = await getAllRepoFiles(
    process.env['DATA_REPOSITORY_URL'],
    process.env['DATA_REPOSITORY_BRANCH'],
    process.env['PRIVATE_DATA_REPOSITORY_URL'],
    process.env['PRIVATE_DATA_REPOSITORY_BRANCH'],
    process.env['GITHUB_ACCESS_TOKEN'],
  ).then(processChangedFiles);

  if (syncErrors.length === 0) {
    await processDeleteOldEntities(databaseTime.now, syncErrors);
  }

  await redis.del('trpc:*');

  console.log('-- Sync procedure: sync cdn repository');

  let publicCdnError;
  try {
    await syncCdnRepository(
      '/tmp/sovereign-university-data',
      process.env['CDN_PATH'] || '/tmp/cdn',
    );
  } catch (error) {
    console.error(error);
    publicCdnError =
      error instanceof Error ? error : new Error('Unknown error');
  }

  let privateCdnError;
  if (
    process.env['PRIVATE_DATA_REPOSITORY_URL'] &&
    process.env['GITHUB_ACCESS_TOKEN']
  ) {
    try {
      await syncCdnRepository(
        '/tmp/sovereign-university-data-paid',
        process.env['CDN_PATH'] || '/tmp/cdn',
      );
    } catch (error) {
      console.error(error);
      privateCdnError =
        error instanceof Error ? error : new Error('Unknown error');
    }
  }

  console.log('-- Sync procedure: END');

  if (syncErrors.length > 0) {
    console.error(
      `=== ${syncErrors.length} ERRORS occurred during the sync process: `,
    );
    console.error(syncErrors.join('\n'));
  }

  return {
    success: syncErrors.length === 0,
    syncErrors: syncErrors.length > 0 ? syncErrors : undefined,
    publicCdnError: publicCdnError,
    privateCdnError: privateCdnError,
  };
}
