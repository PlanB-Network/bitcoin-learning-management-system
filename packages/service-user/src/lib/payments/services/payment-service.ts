import type {
  CheckoutData,
  SwissBitcoinPayCheckout,
  SwissBitcoinPayConfig,
} from '@blms/types';

import type { Dependencies } from '#src/dependencies.js';

export async function checkSatsPrice(dollarPrice: number, satsPrice: number) {
  const response = await fetch('https://mempool.space/api/v1/prices');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  return async (elementId: string, satsPrice: number) => {
    const paymentData = {
      title: elementId,
      amount: satsPrice,
      unit: 'sat',
      onChain: true,
      webhook: `${config.proxyUrl}/users/events/payment/webhooks`,
    };

    const headers = new Headers({
      'Content-Type': 'application/json',
      'api-key': config.apiKey || '',
    });

    try {
      const response = await fetch(
        `https://api.swiss-bitcoin-pay.ch/checkout`,
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(paymentData),
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
        'Content-Type': 'application/json',
        'api-key': config.apiKey || '',
      },
    });

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
      mode: 'payment',
      ui_mode: 'embedded',
      invoice_creation: {
        enabled: true,
      },
      billing_address_collection: 'required',
      metadata: {
        product: productType,
      },
      payment_intent_data: {
        metadata: {
          paymentId: paymentId,
          product: productType,
        },
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: dollarPrice * 100,
            product_data: {
              name: productName,
            },
          },
          quantity: 1,
        },
      ],
      redirect_on_completion: 'never',
      automatic_tax: { enabled: true },
    });
  };
};
