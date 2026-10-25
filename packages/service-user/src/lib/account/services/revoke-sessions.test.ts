/// <reference types="mocha" />

import assert from 'node:assert';

import { createPostgresClient } from '@blms/database';
import { hash } from 'argon2';

import type { Dependencies } from '../../../dependencies.js';
import { createChangePassword } from './change-password.js';
import { createPasswordReset } from './reset-password.js';

// Initialise the module-level `sql` helper. No connection is opened: the fake
// client below never executes a query.
createPostgresClient({
  database: 'test',
  host: '127.0.0.1',
  password: 'test',
  port: 1,
  username: 'test',
});

interface FakeQuery {
  strings?: readonly string[];
  args?: readonly unknown[];
}

const isFakeQuery = (value: unknown): value is FakeQuery =>
  !!value && typeof value === 'object' && 'strings' in value;

const flatten = (query: FakeQuery): { text: string; args: unknown[] } => {
  const parts = [...(query.strings ?? [])];
  const args: unknown[] = [];
  for (const arg of query.args ?? []) {
    if (isFakeQuery(arg)) {
      const nested = flatten(arg);
      parts.push(nested.text);
      args.push(...nested.args);
    } else {
      args.push(arg);
    }
  }
  return { args, text: parts.join('?') };
};

const createPostgres = (respond: (text: string) => unknown[]) => {
  const executed: { text: string; args: unknown[] }[] = [];
  const postgres = {
    exec: async (query: FakeQuery) => {
      const flat = flatten(query);
      executed.push(flat);
      return respond(flat.text);
    },
  };
  const sessionDeletions = () =>
    executed
      .filter((q) => /DELETE FROM users\.sessions/.test(q.text))
      .map((q) => q.args);

  return {
    dependencies: { postgres } as unknown as Dependencies,
    sessionDeletions,
  };
};

describe('sessions after a password change', () => {
  it('a password change logs out every other session of the user', async () => {
    const passwordHash = await hash('old-password');
    const { dependencies, sessionDeletions } = createPostgres((text) =>
      text.includes('FROM users.accounts') ? [{ passwordHash }] : [],
    );

    await createChangePassword(dependencies)({
      newPassword: 'new-password',
      oldPassword: 'old-password',
      sessionId: 'sid-current',
      uid: 'uid-alice',
    });

    assert.deepEqual(sessionDeletions(), [['uid-alice', 'sid-current']]);
  });

  it('a password reset logs out every session of the user', async () => {
    const { dependencies, sessionDeletions } = createPostgres((text) =>
      text.includes('users.tokens') ? [{ uid: 'uid-alice' }] : [],
    );

    const result = await createPasswordReset(dependencies)(
      'token-1',
      'new-password',
    );

    assert.deepEqual(result, { success: true });
    assert.deepEqual(sessionDeletions(), [['uid-alice']]);
  });
});
