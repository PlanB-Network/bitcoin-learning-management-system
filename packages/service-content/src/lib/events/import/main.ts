import type { TransactionSql } from '@blms/database';
import { firstRow } from '@blms/database';
import type { ChangedFile, Event } from '@blms/types';

import { yamlToObject } from '../../utils.js';

import type { ChangedEvent } from './index.js';

interface EventMain {
  id: string;
  project_id?: string;
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
  is_gdpr_compliance: boolean;
  custom_tc_disclaimer: string;
  address_city_country: string;
  address_line_2: string;
  address_line_3: string;
  professor: string;
  course_related: string;
  type: string;
  links?: {
    website: string;
    replay_url: string;
    live_url: string;
    chat_url: string;
  };
  language?: string[];
  tags?: string[];
  test_only?: boolean;
}

export const createProcessMainFile = (transaction: TransactionSql) => {
  return async (event: ChangedEvent, file?: ChangedFile) => {
    if (!file) return;

    const parsedEvent = await yamlToObject<EventMain>(file);

    if (
      parsedEvent.test_only === true &&
      process.env.PLANB_ENVIRONMENT === 'mainnet'
    ) {
      console.log('[sync] Ignore event', parsedEvent.name);
      return;
    }

    const lastUpdated = event.files.sort((a, b) => b.time - a.time)[0];

    if (parsedEvent.book_online == null) {
      parsedEvent.book_online = false;
    }

    if (parsedEvent.is_gdpr_compliance == null) {
      parsedEvent.is_gdpr_compliance = false;
    }

    const result = await transaction<Event[]>`
        INSERT INTO content.events
          ( id,
            project_id,
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
            is_gdpr_compliance,
            custom_tc_disclaimer,
            address_line_1,
            address_line_2,
            address_line_3,
            professor,
            course_related,
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
          ${parsedEvent.id},
          ${parsedEvent.project_id},
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
          ${parsedEvent.is_gdpr_compliance},
          ${parsedEvent.custom_tc_disclaimer},
          ${parsedEvent.address_city_country},
          ${parsedEvent.address_line_2},
          ${parsedEvent.address_line_3},
          ${parsedEvent.professor},
          ${parsedEvent.course_related},
          ${parsedEvent.type.toLowerCase()},
          ${parsedEvent.links?.website},
          ${parsedEvent.links?.replay_url},
          ${parsedEvent.links?.live_url},
          ${parsedEvent.links?.chat_url},
          ${lastUpdated.time},
          ${lastUpdated.commit},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          path = EXCLUDED.path,
          project_id = EXCLUDED.project_id,
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          timezone = EXCLUDED.timezone,
          price_dollars = EXCLUDED.price_dollars,
          available_seats = EXCLUDED.available_seats,
          book_online = EXCLUDED.book_online,
          book_in_person = EXCLUDED.book_in_person,
          is_gdpr_compliance = EXCLUDED.is_gdpr_compliance,
          custom_tc_disclaimer = EXCLUDED.custom_tc_disclaimer,
          address_line_1 = EXCLUDED.address_line_1,
          address_line_2 = EXCLUDED.address_line_2,
          address_line_3 = EXCLUDED.address_line_3,
          professor = EXCLUDED.professor,
          course_related = EXCLUDED.course_related,
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

    if (result && parsedEvent.tags && parsedEvent.tags?.length > 0) {
      const lowercaseTags = parsedEvent.tags.map((tag) => tag.toLowerCase());

      await transaction`
        DELETE FROM content.event_tags WHERE event_id = ${result.id}
      `;

      await transaction`
        INSERT INTO content.tags ${transaction(lowercaseTags.map((tag) => ({ name: tag })))}
        ON CONFLICT (name) DO NOTHING
      `;

      await transaction`
          INSERT INTO content.event_tags (event_id, tag_id)
          SELECT
            ${result.id},
            id
            FROM content.tags
            WHERE name = ANY(${lowercaseTags})
          ON CONFLICT DO NOTHING
        `;
    }

    if (result) {
      await transaction`
        DELETE FROM content.event_languages
        WHERE event_id = ${result.id}
      `;
    }

    if (result && parsedEvent.language && parsedEvent.language?.length > 0) {
      for (const language of parsedEvent.language) {
        await transaction`
            INSERT INTO content.event_languages (event_id, language)
            VALUES(
              ${result.id},
              LOWER(${language})
            )
            ON CONFLICT DO NOTHING
          `;
      }
    }
  };
};
