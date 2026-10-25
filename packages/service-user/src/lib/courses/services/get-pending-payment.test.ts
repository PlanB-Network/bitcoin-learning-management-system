/// <reference types="mocha" />

import assert from 'node:assert';
import { createPostgresClient } from '@blms/database';
import { createGetPendingCoursePayments } from './get-pending-payment.js';

describe('createGetPendingCoursePayments', () => {
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

  it('polls users.course_payment, not users.event_payment', async () => {
    let captured: any;
    const postgres = {
      exec: async (q: any) => {
        captured = q;
        return [];
      },
    };

    await createGetPendingCoursePayments({ postgres } as any)();

    const text = captured.strings.join('?');
    assert.match(text, /users\.course_payment/);
    assert.doesNotMatch(text, /users\.event_payment/);
    assert.match(text, /course_id/);
  });
});
