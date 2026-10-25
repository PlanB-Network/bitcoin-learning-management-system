/// <reference types="mocha" />

import assert from 'node:assert';

import { EducatorContentStatus } from '@blms/constants';
import { createPostgresClient } from '@blms/database';
import type { JoinedEducatorContent } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { createCreateEducatorContent } from './create-educator-content.js';
import { createUpdateEducatorContent } from './update-educator-content.js';

interface CapturedQuery {
  strings: readonly string[];
  args: unknown[];
}

// Records every query; SELECTs find a published content owned by uid-alice.
const createPostgres = () => {
  const writes: CapturedQuery[] = [];
  const postgres = {
    exec: async (query: CapturedQuery) => {
      const text = query.strings.join('?');
      if (/\b(INSERT|UPDATE)\b/.test(text)) {
        writes.push(query);
      }
      return [
        {
          id: 'content-1',
          status: EducatorContentStatus.Published,
          uid: 'uid-alice',
        },
      ];
    },
  };
  return { dependencies: { postgres } as unknown as Dependencies, writes };
};

// Test double: only the columns the INSERT reads; timestamps and counters are
// filled by the database.
const userInput = {
  cover: null,
  description: null,
  language: 'en',
  license: 'CC-BY-SA',
  originalId: null,
  title: 'My flyer',
  type: 'flyer',
  uid: 'uid-alice',
} as unknown as Omit<JoinedEducatorContent, 'id' | 'links' | 'files'>;

describe('educator content written by its author', () => {
  before(() => {
    // postgres.js connects lazily: building a query never opens a socket
    createPostgresClient({
      database: 'x',
      host: '127.0.0.1',
      password: 'x',
      port: 1,
      username: 'x',
    });
  });

  it('is created as a draft even when the request says published', async () => {
    const { dependencies, writes } = createPostgres();

    await createCreateEducatorContent(dependencies)({
      ...userInput,
      status: EducatorContentStatus.Published,
    });

    assert.equal(writes.length, 1);
    assert.ok(!writes[0].args.includes(EducatorContentStatus.Published));
    assert.ok(writes[0].args.includes(EducatorContentStatus.Draft));
  });

  it('goes back to draft when its author edits it', async () => {
    const { dependencies, writes } = createPostgres();
    const update = createUpdateEducatorContent(dependencies);

    // Publishing explicitly, and editing a published content without status
    await update({
      id: 'content-1',
      status: EducatorContentStatus.Published,
      title: 'Edited',
      uid: 'uid-alice',
    });
    await update({ id: 'content-1', title: 'Edited', uid: 'uid-alice' });

    assert.equal(writes.length, 2);
    for (const write of writes) {
      assert.ok(!write.args.includes(EducatorContentStatus.Published));
      assert.ok(write.args.includes(EducatorContentStatus.Draft));
    }
  });
});
