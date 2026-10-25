/// <reference types="mocha" />

import assert from 'node:assert';

import { createPostgresClient } from '@blms/database';

import type { Dependencies } from '#src/dependencies.js';
import type { Context } from '#src/trpc/index.js';

import { trpcRouter } from './trpc-router.js';

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

interface ExecutedQuery {
  text: string;
  args: unknown[];
}

const isFakeQuery = (value: unknown): value is FakeQuery =>
  !!value && typeof value === 'object' && 'strings' in value;

// postgres.js nests fragments (sql`...` inside sql`...`): flatten them.
const flatten = (query: FakeQuery): ExecutedQuery => {
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

const createCaller = (
  respond: (query: ExecutedQuery) => unknown[],
  extra: Partial<Record<keyof Dependencies, unknown>> = {},
) => {
  const executed: ExecutedQuery[] = [];

  const dependencies = {
    config: { sendgrid: { enable: false } },
    postgres: {
      exec: async (query: FakeQuery) => {
        const flat = flatten(query);
        executed.push(flat);
        return respond(flat);
      },
    },
    ...extra,
  } as unknown as Dependencies;

  const session = { permissions: null, role: 'student', uid: 'uid-alice' };

  // Test double: only the parts of the Express context the procedures read.
  const ctx = {
    dependencies: { ...dependencies, log: () => {} },
    log: () => {},
    req: { log: () => {}, session },
    requestId: 'test',
    res: {},
    sessionId: 'test',
  } as unknown as Context;

  return { caller: trpcRouter.createCaller(ctx), executed };
};

const bookings = (executed: ExecutedQuery[]) =>
  executed.filter((q) => /INSERT INTO users\.user_event/.test(q.text));

describe('paid content access', () => {
  it('a student cannot book a paid event without paying', async () => {
    const { caller, executed } = createCaller((q) =>
      q.text.includes('content.events') ? [{ priceDollars: 100 }] : [],
    );

    const error = await caller.user.events
      .saveUserEvent({
        booked: true,
        eventId: 'event-paid',
        withPhysical: true,
      })
      .catch((e: unknown) => e);

    assert.deepEqual(
      bookings(executed),
      [],
      'a booking was stored for a paid event',
    );
    assert.match(String(error), /Payment required/);
  });

  it('a student who paid, or who books a free event, still gets a booking', async () => {
    for (const respond of [
      // Paid event, paid payment
      (q: ExecutedQuery) => {
        if (q.text.includes('content.events')) return [{ priceDollars: 100 }];
        if (q.text.includes('users.event_payment')) return [{ uid: 'x' }];
        return [];
      },
      // Free event
      (q: ExecutedQuery) =>
        q.text.includes('content.events') ? [{ priceDollars: 0 }] : [],
    ]) {
      const { caller, executed } = createCaller(respond);

      await caller.user.events
        .saveUserEvent({ booked: true, eventId: 'event', withPhysical: true })
        .catch(() => undefined);

      assert.equal(bookings(executed).length, 1);
    }
  });

  it("a student cannot read another user's course payment", async () => {
    let leaked = false;
    const { caller } = createCaller((q) => {
      if (!q.text.includes('course_payment')) {
        return [];
      }
      // The table only holds Bob's payment: a lookup scoped to Alice finds nothing.
      if (q.args.includes('uid-alice')) {
        return [];
      }
      leaked = true;
      return [
        {
          amount: 300,
          courseId: 'course-1',
          format: 'online',
          invoiceUrl: 'https://invoice.example/bob',
          paymentId: 'pay-bob',
          paymentStatus: 'paid',
        },
      ];
    });

    await caller.user.courses
      .getPayment({ paymentId: 'pay-bob' })
      .catch(() => undefined);

    assert.equal(leaked, false, "Bob's payment was returned to Alice");
  });

  it('public search never returns document bodies and caps snippets', async () => {
    const secret = 'FULL TEXT OF A CHAPTER';
    let params: Record<string, unknown> = {};

    const typesense = {
      collections: () => ({
        documents: () => ({
          search: async (searchParams: Record<string, unknown>) => {
            params = searchParams;
            const excluded = String(searchParams.exclude_fields ?? '').split(
              ',',
            );
            const document: Record<string, unknown> = {
              link: '/en/courses/paid/chapter',
              title: 'Paid chapter',
              type: 'course_chapter',
            };
            if (!excluded.includes('body')) {
              document.body = secret;
            }
            return {
              found: 1,
              hits: [{ document, highlight: {} }],
              page: 1,
              search_time_ms: 1,
            };
          },
        }),
      }),
    };

    const { caller } = createCaller(() => [], { typesense });

    const result = await caller.content.search({
      includeBody: true,
      language: 'en',
      query: 'chapter',
      surroundingWords: 100_000,
    } as never);

    assert.ok(
      !JSON.stringify(result).includes(secret),
      'document body returned by public search',
    );
    assert.ok(
      Number(params.highlight_affix_num_tokens) <= 50,
      `snippet size not capped: ${params.highlight_affix_num_tokens}`,
    );
  });
});
