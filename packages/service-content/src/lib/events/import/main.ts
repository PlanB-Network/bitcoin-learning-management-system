import type { TransactionSql } from '@blms/database';
import { firstRow } from '@blms/database';
import type { ChangedFile, Event } from '@blms/types';

import { yamlToObject } from '../../utils.js';

import type { ChangedEvent } from './index.js';

interface EventMain {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  timezone: string;
  price_dollars: number;
  available_seats: number;
  remaining_seats: number;
  book_online: boolean;
  book_in_person: boolean;
  address_line_1: string;
  address_line_2: string;
  address_line_3: string;
  builder: string;
  type: string;
  links: {
    website: string;
    replay_url: string;
    live_url: string;
    chat_url: string;
  };
  language?: string[];
  tag?: string[];
}

export const createProcessMainFile = (transaction: TransactionSql) => {
  return async (event: ChangedEvent, file?: ChangedFile) => {
    if (!file) return;

    // Only get the tags from the main tutorial file
    const parsedEvents = yamlToObject<EventMain[]>(file.data);

    const lastUpdated = event.files.sort((a, b) => b.time - a.time)[0];

    for (const parsedEvent of parsedEvents) {
      const result = await transaction<Event[]>`
        INSERT INTO content.events
          ( id,
            path,
            name,
            description,
            start_date,
            end_date,
            timezone,
            price_dollars,
            available_seats,
            remaining_seats,
            book_online,
            book_in_person,
            address_line_1,
            address_line_2,
            address_line_3,
            builder,
            type,
            website_url,
            replay_url,
            live_url,
            chat_url,
            last_updated,
            last_commit,
            last_sync
          )
        VALUES (
          ${`${event.id}-${parsedEvent.name.replaceAll(/\W/g, '')}`},
          ${event.path},
          ${parsedEvent.name},
          ${parsedEvent.description},
          ${parsedEvent.start_date},
          ${parsedEvent.end_date},
          ${parsedEvent.timezone},
          ${parsedEvent.price_dollars},
          ${parsedEvent.available_seats},
          ${parsedEvent.available_seats},
          ${parsedEvent.book_online},
          ${parsedEvent.book_in_person},
          ${parsedEvent.address_line_1},
          ${parsedEvent.address_line_2},
          ${parsedEvent.address_line_3},
          ${parsedEvent.builder},
          ${parsedEvent.type.toLowerCase()},
          ${parsedEvent.links.website},
          ${parsedEvent.links.replay_url},
          ${parsedEvent.links.live_url},
          ${parsedEvent.links.chat_url},
          ${lastUpdated.time},
          ${lastUpdated.commit},
          NOW()
        )
        ON CONFLICT (path) DO UPDATE SET
          id = EXCLUDED.id,
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          timezone = EXCLUDED.timezone,
          price_dollars = EXCLUDED.price_dollars,
          available_seats = EXCLUDED.available_seats,
          book_online = EXCLUDED.book_online,
          book_in_person = EXCLUDED.book_in_person,
          address_line_1 = EXCLUDED.address_line_1,
          address_line_2 = EXCLUDED.address_line_2,
          address_line_3 = EXCLUDED.address_line_3,
          builder = EXCLUDED.builder,
          type = EXCLUDED.type,
          website_url = EXCLUDED.website_url,
          replay_url = EXCLUDED.replay_url,
          live_url = EXCLUDED.live_url,
          chat_url = EXCLUDED.chat_url,
          raw_description = EXCLUDED.raw_description,
          last_updated = EXCLUDED.last_updated,
          last_commit = EXCLUDED.last_commit,
          last_sync = NOW()
        RETURNING *
      `.then(firstRow);

      if (!result) {
        throw new Error('Could not insert events');
      }

      if (result && parsedEvent.tag && parsedEvent.tag?.length > 0) {
        await transaction`
          INSERT INTO content.tags ${transaction(
            parsedEvent.tag.map((tag) => ({ name: tag.toLowerCase() })),
          )}
          ON CONFLICT (name) DO NOTHING
        `;

        await transaction`
          INSERT INTO content.event_tags (event_id, tag_id)
          SELECT
            ${result.id},
            id FROM content.tags WHERE name = ANY(${parsedEvent.tag})
          ON CONFLICT DO NOTHING
        `;
      }

      if (result && parsedEvent.language && parsedEvent.language?.length > 0) {
        for (const language of parsedEvent.language) {
          await transaction`
            INSERT INTO content.event_languages (event_id, language)
            VALUES(
              ${result.id},
              ${language}
            )
            ON CONFLICT DO NOTHING
          `;
        }
      }
    }
  };
};
