import { t } from 'i18next';
import { Trans } from 'react-i18next';

import { Button } from '@sovereign-university/ui';

import PlanBLogo from '#src/assets/planb_logo_horizontal_black.svg?react';
import { PaymentCallout } from '#src/components/payment-callout.js';

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

interface ModalBookDescriptionProps {
  paidPriceDollars: number | null;
  satsPrice: number;
  callout: string;
  description: string;
  onBooked: () => void;
}

export const ModalBookDescription = ({
  paidPriceDollars,
  satsPrice,
  callout,
  description,
  onBooked,
}: ModalBookDescriptionProps) => {
  return (
    <div className="items-center justify-center w-60 lg:w-96 flex flex-col gap-6">
      <PlanBLogo className="h-auto" width={240} />
      <PaymentCallout description={callout} />
      <span className="text-sm">{description}</span>
      <div className="flex flex-row justify-between w-full">
        <span className="text-lg font-medium">{t('payment.total')}</span>
        <div className="flex flex-col items-end">
          <span className="text-lg font-medium">
            {getFormattedUnit(paidPriceDollars || 0, DEFAULT_CURRENCY, 0)}
          </span>
          <span className="text-sm text-gray-400/50">{satsPrice} sats</span>
        </div>
      </div>
      <Button variant="tertiary" className="w-full" onClick={onBooked}>
        Book seat
      </Button>
      <div className=" text-center uppercase md:text-xs">
        <p className="mb-2 text-[8px] md:text-[10px]">
          {t('payment.feeDistribution')}{' '}
        </p>

        <div className="text-[10px] md:text-xs">
          <Trans i18nKey="payment.terms">
            <a
              className="underline underline-offset-2 hover:text-darkOrange-5"
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
