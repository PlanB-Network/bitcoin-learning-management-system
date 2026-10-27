/// <reference types="mocha" />

import assert from 'node:assert';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { GeneralPaymentItem } from '@blms/constants';
import { createPostgresClient } from '@blms/database';
import { TRPCError } from '@trpc/server';
import express, { json, Router } from 'express';

import type { Dependencies } from '#src/dependencies.js';
import type { Context } from '#src/trpc/index.js';

import { createRestPaymentRoutes } from './rest/payment.js';
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

// What would move money: Stripe API calls and payment rows written.
// Outbound HTTP (SwissBitcoinPay, mempool.space) is recorded in `fetches`.
interface Effects {
  queries: string[];
  stripeCalls: string[];
}

interface FakeQuery {
  strings?: readonly string[];
  args?: readonly unknown[];
}

const isFakeQuery = (value: unknown): value is FakeQuery =>
  !!value && typeof value === 'object' && 'strings' in value;

// postgres.js nests fragments (sql`...` inside sql`...`): flatten their text
const flatten = (query: FakeQuery): string =>
  [
    ...(query.strings ?? []),
    ...(query.args ?? []).filter(isFakeQuery).map(flatten),
  ].join(' ');

const createDependencies = (
  paymentsDisabled: boolean,
  respond: (text: string) => unknown[],
) => {
  const effects: Effects = { queries: [], stripeCalls: [] };

  const stripe = {
    checkout: {
      sessions: {
        create: async () => {
          effects.stripeCalls.push('checkout.sessions.create');
          return { client_secret: 'cs_secret', id: 'cs_test' };
        },
      },
    },
    webhooks: {
      constructEvent: () => {
        effects.stripeCalls.push('webhooks.constructEvent');
        throw new Error('No signatures found');
      },
    },
  };

  const dependencies = {
    config: {
      paymentsDisabled,
      sendgrid: { enable: false },
      stripe: { endpointSecret: 'whsec_test', publicKey: 'pk_test' },
      swissBitcoinPay: { apiKey: 'sbp-key', hmacSecret: null, proxyUrl: '' },
    },
    log: () => {},
    postgres: {
      exec: async (query: FakeQuery) => {
        const text = flatten(query);
        effects.queries.push(text);
        return respond(text);
      },
    },
    stripe,
  } as unknown as Dependencies;

  return { dependencies, effects };
};

const createCaller = (dependencies: Dependencies) => {
  const session = { permissions: null, role: 'student', uid: 'uid-alice' };
  // Test double: only the parts of the Express context the procedures read.
  const ctx = {
    dependencies,
    log: () => {},
    req: { log: () => {}, session },
    requestId: 'test',
    res: {},
    sessionId: 'test',
  } as unknown as Context;

  return trpcRouter.createCaller(ctx);
};

// Outbound HTTP is recorded and answered locally; local calls go through.
let realFetch: typeof fetch;
let fetches: string[] = [];
beforeEach(() => {
  fetches = [];
  realFetch = globalThis.fetch;
  globalThis.fetch = (async (
    input: string | URL | Request,
    init?: RequestInit,
  ) => {
    const url = input instanceof Request ? input.url : input.toString();
    if (url.startsWith('http://127.0.0.1')) {
      return realFetch(input, init);
    }
    fetches.push(url);
    return Response.json({ USD: 100_000, amount: 1, id: 'chk-1' });
  }) as typeof fetch;
});
afterEach(() => {
  globalThis.fetch = realFetch;
});

// A $100 course, a $100 event; the summer school is $2500 in code
const respondPaid = (text: string) => {
  if (text.includes('content.courses')) {
    return [{ inpersonPriceDollars: 100, onlinePriceDollars: 100 }];
  }
  if (text.includes('content.events')) {
    return [{ priceDollars: 100 }];
  }
  return [];
};

type Product = 'course' | 'event' | 'general';

// Open a paid checkout for `product` with every payment kill switch on
const openPaidCheckout = (product: Product, method: 'sbp' | 'stripe') => {
  const { dependencies, effects } = createDependencies(true, respondPaid);
  const caller = createCaller(dependencies);
  const checkouts = {
    course: () =>
      caller.user.courses.saveCoursePayment({
        courseId: 'course-1',
        courseIndex: 'btc101',
        dollarPrice: 100,
        format: 'online',
        method,
        satsPrice: 100_000,
      }),
    event: () =>
      caller.user.events.saveEventPayment({
        dollarPrice: 100,
        eventId: 'event-1',
        method,
        satsPrice: 100_000,
        withPhysical: true,
      }),
    general: () =>
      caller.user.saveGeneralPayment({
        dollarPrice: 2500,
        item: GeneralPaymentItem.SummerSchool2025,
        method,
        satsPrice: 2_500_000,
      }),
  };
  return { effects, result: checkouts[product]().catch((e: unknown) => e) };
};

describe('PAYMENTS_DISABLED kill switch', () => {
  for (const method of ['stripe', 'sbp'] as const) {
    it(`refuses every paid ${method} checkout without reaching the provider`, async () => {
      for (const product of ['course', 'event', 'general'] as const) {
        const { effects, result } = openPaidCheckout(product, method);
        const error = await result;

        assert.ok(error instanceof TRPCError, `${product}: ${String(error)}`);
        assert.equal(error.code, 'FORBIDDEN');
        assert.match(error.message, /Payments are disabled/);
        assert.deepEqual(effects.stripeCalls, [], `${product}: Stripe called`);
        assert.deepEqual(fetches, [], `${product}: provider called`);
        assert.deepEqual(
          effects.queries.filter((q) => /INSERT INTO/.test(q)),
          [],
          `${product}: payment row written`,
        );
      }
    });
  }

  it('still lets a free (0 $) course checkout through', async () => {
    const { dependencies, effects } = createDependencies(true, (text) => {
      if (text.includes('content.courses')) {
        return [{ onlinePriceDollars: 0 }];
      }
      if (text.includes('INSERT INTO users.course_payment')) {
        return [
          { courseId: 'course-free', paymentId: 'p-1', uid: 'uid-alice' },
        ];
      }
      return [];
    });

    const result = await createCaller(
      dependencies,
    ).user.courses.saveCoursePayment({
      courseId: 'course-free',
      courseIndex: 'free101',
      dollarPrice: 0,
      format: 'online',
      method: 'sbp',
      satsPrice: 0,
    });

    assert.equal(result.id, 'free');
    assert.ok(
      effects.queries.some((q) => /INSERT INTO users\.course_payment/.test(q)),
      'free enrolment was not stored',
    );
  });

  it('tells the frontend checkout is off', async () => {
    const { dependencies } = createDependencies(true, () => []);
    const config = await createCaller(dependencies).auth.config();
    assert.equal(config.paymentsDisabled, true);
  });

  for (const paymentsDisabled of [true, false]) {
    it(`${paymentsDisabled ? 'refuses' : 'processes'} payment webhooks when PAYMENTS_DISABLED=${paymentsDisabled}`, async function () {
      // The Stripe handler waits one second before verifying the signature
      this.timeout(10_000);

      const { dependencies, effects } = createDependencies(
        paymentsDisabled,
        () => [],
      );
      const app = express();
      app.use(json());
      app.use((req, _res, next) => {
        Object.assign(req, { log: () => {} });
        next();
      });
      const router = Router();
      createRestPaymentRoutes(dependencies, router);
      app.use('/api', router);

      const server = await new Promise<Server>((resolve) => {
        const s = app.listen(0, '127.0.0.1', () => resolve(s));
      });
      const { port } = server.address() as AddressInfo;
      const post = (path: string) =>
        fetch(`http://127.0.0.1:${port}/api${path}`, {
          body: JSON.stringify({ id: 'chk-1' }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        }).then((r) => r.status);

      try {
        const statuses = {
          courses: await post('/users/courses/payment/webhooks'),
          events: await post('/users/events/payment/webhooks'),
          general: await post('/users/general/payment/webhooks'),
          stripe: await post('/webhooks/stripe'),
        };

        if (paymentsDisabled) {
          assert.deepEqual(statuses, {
            courses: 503,
            events: 503,
            general: 503,
            stripe: 503,
          });
          assert.deepEqual(effects.stripeCalls, []);
          assert.deepEqual(fetches, []);
          assert.deepEqual(effects.queries, []);
        } else {
          // Reached the providers: SwissBitcoinPay was asked for the checkout
          // and the Stripe signature was checked (and rejected)
          assert.equal(statuses.stripe, 400);
          assert.deepEqual(effects.stripeCalls, ['webhooks.constructEvent']);
          assert.ok(fetches.some((url) => url.includes('swiss-bitcoin-pay')));
        }
      } finally {
        server.close();
      }
    });
  }
});
