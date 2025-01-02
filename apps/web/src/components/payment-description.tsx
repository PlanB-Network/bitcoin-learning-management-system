import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';

import type { CouponCode, JoinedEvent } from '@blms/types';
import { Button } from '@blms/ui';

import checkGreen from '#src/assets/icons/check_green.svg';
import crossRed from '#src/assets/icons/cross_red.svg';
import spinner from '#src/assets/icons/spinner.svg';
import PlanBLogo from '#src/assets/logo/planb_logo_horizontal_black.svg?react';
import { PaymentCallout } from '#src/components/payment-callout.js';
import { trpc } from '#src/utils/trpc.js';

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
  callout: React.ReactNode;
  description: string;
  itemId: string;
  checkoutError: string | null;
  initPayment: (method: 'sbp' | 'stripe' | null) => Promise<void>;
  updateCoupon?: (coupon: CouponCode | null) => void;
  children?: JSX.Element | JSX.Element[];
}

export const PaymentDescription = ({
  paidPriceDollars,
  satsPrice,
  callout,
  description,
  initPayment,
  updateCoupon,
  itemId,
  checkoutError,
  children,
}: PaymentDescriptionProps) => {
  const splitDescription = description.split('\n');
  const [inputCoupon, setInputCoupon] = useState('');
  const [queryEnabled, setQueryEnabled] = useState(false);
  const [isCouponValid, setIsCouponValid] = useState<boolean | null>(null);

  const {
    data: coupon,
    isLoading,
    isFetched,
    error,
  } = trpc.content.getCouponCode.useQuery(
    {
      code: inputCoupon,
      itemId: itemId,
    },
    {
      enabled: queryEnabled,
    },
  );

  useEffect(() => {
    if (isFetched) {
      if (coupon) {
        setIsCouponValid(true);
        if (updateCoupon) {
          updateCoupon(coupon);
        }
        // Change sats and dollar price !
      } else {
        setIsCouponValid(false);
        if (updateCoupon) {
          updateCoupon(null);
        }
      }
      setQueryEnabled(false);
    }
  }, [coupon, isFetched, updateCoupon]);

  useEffect(() => {
    if (error) {
      setQueryEnabled(false);
      setIsCouponValid(false);
      if (updateCoupon) {
        updateCoupon(null);
      }
    }
  }, [error, updateCoupon]);

  function applyCoupon() {
    if (inputCoupon.trim() === '') {
      return;
    }
    setQueryEnabled(true);
  }

  return (
    <>
      <div className="items-center justify-center w-full max-w-96 lg:w-96 md:w-72 flex flex-col gap-6 max-lg:pb-6 max-lg:pt-8 mt-auto pr-4">
        <PlanBLogo className="h-auto max-lg:hidden" width={240} />
        <PaymentCallout description={callout} />
        <div className="w-full flex flex-col">
          {splitDescription &&
            splitDescription.map((desc) => (
              <p className="text-sm max-lg:text-center mt-3" key={desc}>
                {desc}
              </p>
            ))}
        </div>
        <div className="place-self-start flex flex-row place-items-center">
          <span className="max-md:text-sm">Have a reduction code ?</span>

          <input
            id="emailId"
            type="text"
            value={inputCoupon}
            onChange={(event) => {
              setInputCoupon(event.target.value);
              setIsCouponValid(null);
            }}
            className="border-2 w-24 ml-4 p-1 rounded-lg border-newGray-5 bg-newGray-6 text-newBlack-5"
          />
          <div className="mx-2">
            {isLoading === true && (
              <img src={spinner} alt="spinner" className="size-6" />
            )}
            {isCouponValid === true && (
              <img src={checkGreen} alt="green check" className="size-6" />
            )}
            {isCouponValid === false && (
              <img src={crossRed} alt="red cross" className="size-6" />
            )}
          </div>
          <Button
            variant="secondary"
            size="s"
            className="-ml-1"
            onClick={applyCoupon}
          >
            Apply
          </Button>
        </div>
        <div className="flex flex-row justify-between w-full">
          <span className="text-lg font-medium">{t('payment.total')}</span>
          <div className="flex flex-col items-end">
            <span className="text-lg font-medium">
              {getFormattedUnit(paidPriceDollars || 0, DEFAULT_CURRENCY, 0)}
            </span>
            <span className="text-sm text-gray-400/50">{satsPrice} sats</span>
          </div>
        </div>
        {/* Todo : a generic component should not reference a specific one */}
        {children}
        {checkoutError && (
          <span className="text-red-5 text-center whitespace-pre-line">
            {checkoutError}
          </span>
        )}
        <Button
          variant="primary"
          className="w-full text-xs lg:text-sm"
          onClick={() => {
            initPayment('sbp');
          }}
        >
          {t('payment.payWithBitcoin')}
        </Button>
        <Button
          variant="primary"
          className="w-full text-xs lg:text-sm"
          onClick={() => {
            initPayment('stripe');
          }}
        >
          {t('payment.payByCard')}
        </Button>
      </div>
      <div className="text-center uppercase md:text-xs justify-self-end mt-auto mb-2">
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
    </>
  );
};
