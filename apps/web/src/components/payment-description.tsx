import { t } from 'i18next';
import { Trans } from 'react-i18next';

import type { JoinedEvent } from '@sovereign-university/types';
import { Button } from '@sovereign-university/ui';

import PlanBLogo from '#src/assets/planb_logo_horizontal_black.svg?react';
import { PaymentCallout } from '#src/components/payment-callout.js';
import { ModalPaymentSummary } from '#src/features/events/components/modal-payment-summary.js';

const getFormattedUnit = (amount: number, unit: string, floating = 2) => {
  let prefix = '';
  if (amount > 0 && amount < 0.01) {
    amount = 0.01;
    prefix = `< `;
  }

  if (unit === 'sats') {
    return `${prefix}${amount} sats`;
  }

  return `${prefix}${Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: unit,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: floating,
    maximumFractionDigits: floating,
  }).format(amount)}`;
};

const DEFAULT_CURRENCY = 'USD';

interface PaymentDescriptionProps {
  paidPriceDollars: number | null;
  event?: JoinedEvent;
  accessType?: 'physical' | 'online' | 'replay';
  satsPrice: number;
  callout: string;
  description: string;
  initPayment: () => Promise<void>;
}

export const PaymentDescription = ({
  paidPriceDollars,
  event,
  accessType,
  satsPrice,
  callout,
  description,
  initPayment,
}: PaymentDescriptionProps) => {
  return (
    <div className="items-center justify-center w-full max-w-96 lg:w-96 flex flex-col gap-6 max-lg:pb-6 max-lg:pt-8">
      <PlanBLogo className="h-auto max-lg:hidden" width={240} />
      <PaymentCallout description={callout} />
      <span className="text-sm max-lg:text-center">{description}</span>
      <div className="flex flex-row justify-between w-full max-lg:hidden">
        <span className="text-lg font-medium">{t('payment.total')}</span>
        <div className="flex flex-col items-end">
          <span className="text-lg font-medium">
            {getFormattedUnit(paidPriceDollars || 0, DEFAULT_CURRENCY, 0)}
          </span>
          <span className="text-sm text-gray-400/50">{satsPrice} sats</span>
        </div>
      </div>
      {event && accessType && (
        <ModalPaymentSummary
          event={event}
          accessType={accessType}
          satsPrice={satsPrice}
          mobileDisplay={true}
        />
      )}
      <Button variant="tertiary" className="w-full" onClick={initPayment}>
        {t('payment.proceedToPayment')}
      </Button>
      <div className="text-center uppercase md:text-xs">
        <p className="mb-2 text-[8px] md:text-[10px]">
          {t('payment.feeDistribution')}{' '}
        </p>

        <div className="text-[10px] md:text-xs">
          <Trans i18nKey="payment.terms">
            <a
              className="underline underline-offset-2 hover:text-darkOrange-5 hover:no-underline"
              href="/terms-and-conditions"
              target="_blank"
              rel="noreferrer"
            >
              Payment terms
            </a>
          </Trans>
        </div>
      </div>
    </div>
  );
};
