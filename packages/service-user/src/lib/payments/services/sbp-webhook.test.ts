/// <reference types="mocha" />

import assert from 'node:assert';
import { createHmac } from 'node:crypto';

import type { EnvConfig, SwissBitcoinPayCheckout } from '@blms/types';

import type { SbpPayment } from '../queries/get-sbp-payment.js';
import { createGetSbpCheckout } from './payment-service.js';
import {
  isValidSbpSignature,
  processSbpWebhook,
  type SbpWebhookStore,
} from './sbp-webhook.js';

const CHECKOUT_ID = 'c1a820fb-efad-4240-a90e-b3bc3592af5f';
const AMOUNT = 65_699;

const sbpInvoice = (
  overrides: Partial<SwissBitcoinPayCheckout>,
): SwissBitcoinPayCheckout =>
  ({
    amount: AMOUNT,
    id: CHECKOUT_ID,
    isExpired: false,
    isPaid: false,
    status: 'open',
    ...overrides,
  }) as SwissBitcoinPayCheckout;

describe('SwissBitcoinPay webhook', () => {
  const realFetch = globalThis.fetch;

  // Fake SwissBitcoinPay API: `GET /checkout/{id}` answers from this map
  let sbpInvoices: Map<string, SwissBitcoinPayCheckout>;
  let sbpRequests: string[];

  beforeEach(() => {
    sbpInvoices = new Map();
    sbpRequests = [];
    globalThis.fetch = async (input) => {
      const url = String(input);
      sbpRequests.push(url);
      const id = decodeURIComponent(url.split('/checkout/')[1] ?? '');
      const invoice = sbpInvoices.get(id);
      return invoice
        ? Response.json(invoice)
        : Response.json({ error: 'payment_not_found' }, { status: 404 });
    };
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  // In-memory payment table. markPaid/markExpired follow the guarded UPDATEs
  // of the update-*-payment queries: they only report a transition once.
  const createStore = (rows: SbpPayment[]) => {
    const payments = new Map(rows.map((row) => [row.paymentId, { ...row }]));
    const transitions: string[] = [];
    // Only `swissBitcoinPay` is read by createGetSbpCheckout
    const config = {
      swissBitcoinPay: { apiKey: 'test', hmacSecret: null, proxyUrl: null },
    } as EnvConfig;

    const store: SbpWebhookStore = {
      getCheckout: createGetSbpCheckout({ config }),
      getPayment: async (id) => {
        const payment = payments.get(id);
        return payment ? { ...payment } : null;
      },
      markExpired: async (id) => {
        const payment = payments.get(id);
        if (payment?.paymentStatus !== 'pending') {
          return false;
        }
        payment.paymentStatus = 'expired';
        transitions.push(`expired ${id}`);
        return true;
      },
      markPaid: async (id) => {
        const payment = payments.get(id);
        if (!payment || payment.paymentStatus === 'paid') {
          return false;
        }
        payment.paymentStatus = 'paid';
        transitions.push(`paid ${id}`);
        return true;
      },
    };

    return { payments, store, transitions };
  };

  const pendingPayment = (): SbpPayment => ({
    amount: AMOUNT,
    paymentId: CHECKOUT_ID,
    paymentStatus: 'pending',
  });

  it('ignores a forged {id, isPaid: true} when SwissBitcoinPay reports the checkout unpaid', async () => {
    const { payments, store, transitions } = createStore([pendingPayment()]);
    sbpInvoices.set(CHECKOUT_ID, sbpInvoice({ status: 'open' }));
    const forgedBody = { id: CHECKOUT_ID, isExpired: false, isPaid: true };

    const result = await processSbpWebhook(forgedBody.id, store);

    assert.deepStrictEqual(result, {
      outcome: 'ignored',
      reason: 'checkout open',
    });
    assert.strictEqual(payments.get(CHECKOUT_ID)?.paymentStatus, 'pending');
    assert.deepStrictEqual(transitions, []);
    assert.deepStrictEqual(sbpRequests, [
      `https://api.swiss-bitcoin-pay.ch/checkout/${CHECKOUT_ID}`,
    ]);
  });

  it('ignores a forged {id, isPaid: true} for an id SwissBitcoinPay does not know', async () => {
    // e.g. the id of a pending Stripe payment, which never was an SBP checkout
    const stripePaymentId = '0b8f3c1e-7a51-4d7b-9a33-2f4f1d0d6c11';
    const { store, transitions } = createStore([pendingPayment()]);

    const result = await processSbpWebhook(stripePaymentId, store);

    assert.deepStrictEqual(result, {
      outcome: 'ignored',
      reason: 'unknown checkout',
    });
    assert.deepStrictEqual(transitions, []);
  });

  it('marks the payment paid when SwissBitcoinPay reports it settled for the stored amount', async () => {
    const { payments, store, transitions } = createStore([pendingPayment()]);
    sbpInvoices.set(
      CHECKOUT_ID,
      sbpInvoice({ isExpired: false, isPaid: true, status: 'settled' }),
    );

    const result = await processSbpWebhook(CHECKOUT_ID, store);

    assert.deepStrictEqual(result, { outcome: 'paid' });
    assert.strictEqual(payments.get(CHECKOUT_ID)?.paymentStatus, 'paid');
    assert.deepStrictEqual(transitions, [`paid ${CHECKOUT_ID}`]);
  });

  it('refuses a settled checkout whose amount differs from the stored payment', async () => {
    const { payments, store, transitions } = createStore([pendingPayment()]);
    sbpInvoices.set(
      CHECKOUT_ID,
      sbpInvoice({
        amount: 1,
        isExpired: false,
        isPaid: true,
        status: 'settled',
      }),
    );

    const result = await processSbpWebhook(CHECKOUT_ID, store);

    assert.strictEqual(result.outcome, 'ignored');
    assert.match(
      result.outcome === 'ignored' ? result.reason : '',
      /amount mismatch/,
    );
    assert.strictEqual(payments.get(CHECKOUT_ID)?.paymentStatus, 'pending');
    assert.deepStrictEqual(transitions, []);
  });

  it('is idempotent when the same webhook is delivered twice', async () => {
    const { payments, store, transitions } = createStore([pendingPayment()]);
    sbpInvoices.set(
      CHECKOUT_ID,
      sbpInvoice({ isExpired: false, isPaid: true, status: 'settled' }),
    );

    const first = await processSbpWebhook(CHECKOUT_ID, store);
    const second = await processSbpWebhook(CHECKOUT_ID, store);

    assert.deepStrictEqual(first, { outcome: 'paid' });
    assert.deepStrictEqual(second, {
      outcome: 'ignored',
      reason: 'already paid',
    });
    assert.strictEqual(payments.get(CHECKOUT_ID)?.paymentStatus, 'paid');
    assert.deepStrictEqual(transitions, [`paid ${CHECKOUT_ID}`]);
  });

  it('marks a pending payment expired only when SwissBitcoinPay reports it expired', async () => {
    const { payments, store, transitions } = createStore([pendingPayment()]);
    sbpInvoices.set(
      CHECKOUT_ID,
      sbpInvoice({ isExpired: true, isPaid: false, status: 'expired' }),
    );

    const result = await processSbpWebhook(CHECKOUT_ID, store);

    assert.deepStrictEqual(result, { outcome: 'expired' });
    assert.strictEqual(payments.get(CHECKOUT_ID)?.paymentStatus, 'expired');
    assert.deepStrictEqual(transitions, [`expired ${CHECKOUT_ID}`]);
  });
});

describe('SwissBitcoinPay webhook signature', () => {
  const secret = 'test-hmac-secret';
  const body = Buffer.from(JSON.stringify({ id: CHECKOUT_ID, isPaid: true }));
  const sign = (payload: Buffer) =>
    `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`;

  it('accepts the sbp-sig header computed over the raw body', () => {
    assert.strictEqual(isValidSbpSignature(body, sign(body), secret), true);
  });

  it('rejects a missing, tampered or foreign signature', () => {
    const tampered = Buffer.from(
      JSON.stringify({ id: CHECKOUT_ID, isPaid: false }),
    );

    assert.strictEqual(isValidSbpSignature(body, undefined, secret), false);
    assert.strictEqual(
      isValidSbpSignature(undefined, sign(body), secret),
      false,
    );
    assert.strictEqual(
      isValidSbpSignature(body, sign(tampered), secret),
      false,
    );
    assert.strictEqual(
      isValidSbpSignature(body, sign(body), 'another-secret'),
      false,
    );
    assert.strictEqual(
      isValidSbpSignature(body, sign(body).replace('sha256=', ''), secret),
      false,
    );
  });
});
