import { sql } from '@sovereign-university/database';
import type { ChangedFile } from '@sovereign-university/types';

import type { Dependencies } from '../../dependencies.js';
import type { ChangedContent } from '../../types.js';
import {
  getContentType,
  getRelativePath,
  separateContentFiles,
} from '../../utils.js';

import { createProcessMainFile } from './main.js';

interface EventDetails {
  id: string;
  path: string;
  fullPath: string;
}

export interface ChangedEvent extends ChangedContent {
  id: string;
}

export const groupByEvent = (files: ChangedFile[], errors: string[]) => {
  const eventsFiles = files.filter(
    (item) => getContentType(item.path) === 'resources/conference',
  );

  const groupedEvents = new Map<string, ChangedEvent>();

  for (const file of eventsFiles) {
    try {
      const { id, path: eventPath } = parseDetailsFromPath(file.path);

      const event: ChangedEvent = groupedEvents.get(eventPath) || {
        type: 'events',
        id: id,
        path: eventPath,
        fullPath: eventPath,
        files: [],
      };

      event.files.push({
        ...file,
        path: getRelativePath(file.path, eventPath),
      });

      groupedEvents.set(eventPath, event);
    } catch {
      errors.push(`Unsupported path ${file.path}, skipping file...`);
    }
  }

  return [...groupedEvents.values()];
};

const parseDetailsFromPath = (path: string): EventDetails => {
  const pathElements = path.split('/');

  // Validate that the path has at least 3 elements (courses/name)
  if (pathElements.length < 3) throw new Error('Invalid resource path');

  return {
    id: pathElements[2],
    path: pathElements.slice(0, 3).join('/'),
    fullPath: pathElements.join('/'),
  };
};

export const createUpdateEvents = ({ postgres }: Dependencies) => {
  return async (event: ChangedEvent, errors: string[]) => {
    const { main } = separateContentFiles(event, 'events.yml');

    return postgres
      .begin(async (transaction) => {
        try {
          if (main) {
            const processMainFile = createProcessMainFile(transaction);
            await processMainFile(event, main);
          }
        } catch (error) {
          errors.push(
            `Error processing file(events) ${event?.fullPath}: ${error}`,
          );
          return;
        }
      })
      .catch(() => {
        return;
      });
  };
};

export const createDeleteEvents = ({ postgres }: Dependencies) => {
  return async (sync_date: number, errors: string[]) => {
    try {
      await postgres.exec(
        sql`DELETE FROM content.events WHERE last_sync < ${sync_date} 
      `,
      );
    } catch {
      errors.push(`Error deleting events`);
    }
  };
};
