import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getRecentEventsQuery } from '../queries/index.js';

export const createGetRecentEvents =
  (dependencies: Dependencies) => async () => {
    const { postgres } = dependencies;

    const events = await postgres.exec(getRecentEventsQuery());

    return events.map((event) => ({
      ...event,
      picture: event.id
        ? computeAssetCdnUrl(event.lastCommit, event.path, 'thumbnail.webp')
        : undefined,
    }));
  };
