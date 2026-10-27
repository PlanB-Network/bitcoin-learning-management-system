import type {
  CheckoutData,
  EnvConfig,
  SwissBitcoinPayCheckout,
  SwissBitcoinPayConfig,
} from '@blms/types';
import { TRPCError } from '@trpc/server';

import type { Dependencies } from '#src/dependencies.js';

export const PAYMENTS_DISABLED_MESSAGE =
  'Payments are disabled on Plan B Academy';

/**
 * Kill switch (`PAYMENTS_DISABLED=true`): refuse to open a paid checkout,
 * whatever the provider. Callers skip it for free (0 $) checkouts.
 */
export const assertPaymentsEnabled = (
  config: Pick<EnvConfig, 'paymentsDisabled'>,
) => {
  if (config.paymentsDisabled) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: PAYMENTS_DISABLED_MESSAGE,
    });
  }
};

export async function checkSatsPrice(dollarPrice: number, satsPrice: number) {
  const response = await fetch('https://mempool.space/api/v1/prices');
  const data: any = await response.json();
  const conversionRate = data.USD;

  let calculatedSatsPrice = Number.POSITIVE_INFINITY;
  if (conversionRate) {
    calculatedSatsPrice = Math.round(
      (dollarPrice * 100_000_000) / conversionRate,
    );
    if (process.env.NODE_ENV === 'development') {
      calculatedSatsPrice = 10; // does not work when coupons
    }
  }

  const priceDiff = Math.abs(satsPrice - calculatedSatsPrice);
  const priceDiffPct = Math.abs(1 - satsPrice / calculatedSatsPrice);
  if (priceDiff > 2000 && priceDiffPct > 0.05) {
    throw new Error(
      'Sats price is wrong or price moved very quickly, try again',
    );
  }
}

/** Product family of a SwissBitcoinPay checkout, also the webhook route segment */
export type SbpPaymentType = 'courses' | 'events' | 'general';

export const createSbpPayment = (config: SwissBitcoinPayConfig) => {
  return async (elementId: string, satsPrice: number, type: SbpPaymentType) => {
    const ONE_MONTH = 60 * 24 * 30;

    const paymentData = {
      amount: satsPrice,
      delay: ONE_MONTH,
      onChain: true,
      title: elementId,
      unit: 'sat',
      webhook: `${config.proxyUrl}/users/${type}/payment/webhooks`,
    };

    const headers = new Headers({
      'api-key': config.apiKey || '',
      'Content-Type': 'application/json',
    });

    try {
      const response = await fetch(
        'https://api.swiss-bitcoin-pay.ch/checkout',
        {
          body: JSON.stringify(paymentData),
          headers: headers,
          method: 'POST',
        },
      );

      if (!response.ok) {
        console.log('Network response was not ok', response);
        throw new Error('Network response was not ok');
      }

      return (await response.json()) as CheckoutData;
    } catch (error) {
      console.log('Checkout error :', error);
      throw new Error('Checkout error');
    }
  };
};

/**
 * Pull SwissBitcoinPay checkout status.
 * Resolves to `null` when SwissBitcoinPay does not know the id (HTTP 404).
 */
export const createGetSbpCheckout = (ctx: Pick<Dependencies, 'config'>) => {
  const config = ctx.config.swissBitcoinPay;

  return async (id: string): Promise<SwissBitcoinPayCheckout | null> => {
    const url = `https://api.swiss-bitcoin-pay.ch/checkout/${encodeURIComponent(id)}`;
    const response = await fetch(url, {
      headers: {
        'api-key': config.apiKey || '',
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return null;
    }

    // Check if the response is ok (status in the range 200-299).
    if (!response.ok) {
      console.log(`[Error] Network response was not ok: ${response.status}`);
      throw new Error(`[sbp] Network response was not ok: ${response.status}`);
    }

    return response.json() as Promise<SwissBitcoinPayCheckout>;
  };
};

export const createStripePayment = ({
  stripe,
}: Pick<Dependencies, 'stripe'>) => {
  return (
    productName: string,
    productType: string,
    dollarPrice: number,
    paymentId: string,
    userEmail?: string,
  ) => {
    if (!stripe) {
      throw new Error('Stripe instance is not available');
    }

    return stripe.checkout.sessions.create({
      automatic_tax: { enabled: true },
      billing_address_collection: 'required',
      customer_email: userEmail,
      invoice_creation: {
        enabled: true,
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
            },
            unit_amount: dollarPrice * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        product: productType,
      },
      mode: 'payment',
      payment_intent_data: {
        metadata: {
          paymentId: paymentId,
          product: productType,
        },
      },
      redirect_on_completion: 'never',
      ui_mode: 'embedded',
    });
  };
};
