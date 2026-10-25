/// <reference types="mocha" />

import assert from 'node:assert';

import { createPostgresClient } from '@blms/database';

import { createIndexContent } from './search.js';

// Initialise the module-level `sql` helper. No connection is opened: the fake
// client below never executes a query.
createPostgresClient({
  database: 'test',
  host: '127.0.0.1',
  password: 'test',
  port: 1,
  username: 'test',
});

describe('search index', () => {
  it('does not index the text of chapters of paid courses', async () => {
    const queries: string[] = [];

    const postgres = {
      exec: async (query: { strings: readonly string[] }) => {
        queries.push(query.strings.join('?'));
        return [];
      },
    };

    const typesense = {
      collections: () => ({
        create: async () => undefined,
        delete: async () => undefined,
        documents: () => ({ import: async () => undefined }),
      }),
    };

    await createIndexContent({
      postgres,
      typesense,
    } as unknown as Parameters<typeof createIndexContent>[0])([]);

    const chapters = queries.find((q) =>
      q.includes("'course_chapter' as type"),
    );
    assert.ok(chapters, 'course chapters are not indexed');
    // The index is public: the body of a chapter must depend on whether its
    // course requires a payment.
    assert.match(
      chapters,
      /requires_payment/,
      'chapters of paid courses are indexed with their full text',
    );
  });
});
