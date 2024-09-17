import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getRecentEventsQuery } from '../queries/get-events.js';

export const createGetRecentEvents = ({ postgres }: Dependencies) => {
  return async () => {
    const events = await postgres.exec(getRecentEventsQuery());

    return events.map((event) => ({
      ...event,
      picture: event.id
        ? computeAssetCdnUrl(event.lastCommit, event.path, 'thumbnail.webp')
        : undefined,
    }));
  };
};
