import type { ApiEvents } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';

export const createPollLnurlAuth =
  (dependencies: Dependencies) =>
  ({ sessionId }: { sessionId?: string }) => {
    const { events } = dependencies;

    if (!sessionId) {
      throw new Error('No sessionId provided');
    }

    return new Promise<{ uid: string }>((resolve) => {
      const listener: ApiEvents['lnurl-auth:logged'] = (event) => {
        console.log(`Poll ${event.sessionId}`);
        if (event.sessionId === sessionId) {
          events.off('lnurl-auth:logged', listener);
          resolve({ uid: event.uid });
        }
      };

      events.on('lnurl-auth:logged', listener);
    });
  };
