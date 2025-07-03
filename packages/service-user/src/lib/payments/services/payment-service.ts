import type {
  CheckoutData,
  SwissBitcoinPayCheckout,
  SwissBitcoinPayConfig,
} from '@blms/types';

import type { Dependencies } from '#src/dependencies.js';

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

export const createSbpPayment = (config: SwissBitcoinPayConfig) => {
  return async (
    elementId: string,
    satsPrice: number,
    type: 'courses' | 'events' | 'general',
  ) => {
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
 * Pull SwissBitcoinPay checkout status
 */
export const createGetSbpCheckout = (ctx: Dependencies) => {
  const config = ctx.config.swissBitcoinPay;

  return async (id: string) => {
    const url = `https://api.swiss-bitcoin-pay.ch/checkout/${id}`;
    const response = await fetch(url, {
      headers: {
        'api-key': config.apiKey || '',
        'Content-Type': 'application/json',
      },
    });

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
  ) => {
    return stripe.checkout.sessions.create({
      automatic_tax: { enabled: true },
      billing_address_collection: 'required',
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
