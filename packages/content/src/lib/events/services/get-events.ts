import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getEventsQuery } from '../queries/index.js';

export const createGetEvents = (dependencies: Dependencies) => async () => {
  const { postgres } = dependencies;

  const events = await postgres.exec(getEventsQuery());

  return events.map((event) => ({
    ...event,
    picture: event.id
      ? computeAssetCdnUrl(event.lastCommit, event.path, 'thumbnail.webp')
      : undefined,
  }));
};
