import { GeneralPaymentItem } from '@blms/constants';
import type { CouponCode, JoinedEvent } from '@blms/types';
import { Button, Checkbox, cn, Divider } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { type JSX, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import checkGreen from '#src/assets/icons/check_green.svg';
import spinner from '#src/assets/icons/spinner.svg';
import PlanBLogo from '#src/assets/logo/planb_logo_horizontal_black.svg?react';
import { PaymentCallout } from '#src/components/payment-callout.js';
import { trpc } from '#src/utils/trpc.js';

const getFormattedUnit = (amount: number, unit: string, floating = 2) => {
  let prefix = '';
  if (amount > 0 && amount < 0.01) {
    // biome-ignore lint/style/noParameterAssign: explanation
    amount = 0.01;
    prefix = '< ';
  }

  if (unit === 'sats') {
    return `${prefix}${amount} sats`;
  }

  return `${prefix}${Intl.NumberFormat(undefined, {
    currency: unit,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: floating,
    minimumFractionDigits: floating,
    style: 'currency',
  }).format(amount)}`;
};

const DEFAULT_CURRENCY = 'USD';

interface PaymentDescriptionProps {
  paidPriceDollars: number | null;
  event?: JoinedEvent;
  accessType?: 'physical' | 'online' | 'replay';
  satsPrice: number;
  callout?: React.ReactNode;
  description: string;
  isGdprCompliance: boolean;
  gdprTerms: string;
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
  isGdprCompliance,
  gdprTerms,
  initPayment,
  updateCoupon,
  itemId,
  checkoutError,
  children,
}: PaymentDescriptionProps) => {
  const { t } = useTranslation();
  const splitDescription = description.split('\n');
  const [inputCoupon, setInputCoupon] = useState('');
  const [queryEnabled, setQueryEnabled] = useState(false);
  const [isCouponValid, setIsCouponValid] = useState<boolean | null>(null);

  const [isBookEnabled, setIsBookEnabled] = useState(!isGdprCompliance);
  const [isBtnClicked, setIsBtnClicked] = useState(false);

  let couponId = itemId;
  if (itemId === GeneralPaymentItem.SummerSchool2025) {
    couponId = 'c762773a-9017-4129-bc0e-06adf86050ef';
  }

  const {
    data: coupon,
    isLoading,
    isFetched,
    error,
  } = useQuery(
    trpc.content.getCouponCode.queryOptions(
      {
        code: inputCoupon,
        itemId: couponId,
      },
      {
        enabled: queryEnabled,
        staleTime: 0,
      },
    ),
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

  function displayReductionCode() {
    return (
      <div className="flex flex-col w-full gap-2">
        <p className="font-medium max-md:text-sm">
          {t('payment.haveReductionCode')}
        </p>

        <div className="flex flex-row gap-4 w-full justify-between">
          <div className="relative w-full">
            <input
              id="emailId"
              type="text"
              value={inputCoupon}
              onChange={(event) => {
                setInputCoupon(event.target.value);
                setIsCouponValid(null);
              }}
              className="border-2 px-2 py-1  rounded-lg border-newGray-5 text-newBlack-5 w-full placeholder-newGray-3"
              placeholder={t('payment.insertReductionCode')}
            />

            {isLoading === true && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <img src={spinner} alt="spinner" className="size-6" />
              </div>
            )}
            {isCouponValid === true && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <img src={checkGreen} alt="green check" className="size-6" />
              </div>
            )}
          </div>

          <Button
            variant="secondary"
            mode="light"
            size="s"
            className="-ml-1"
            onClick={applyCoupon}
          >
            Apply
          </Button>
        </div>
        {isCouponValid === false && (
          <div className="text-red-6">Invalid code</div>
        )}
      </div>
    );
  }
  return (
    <>
      <div className="items-center justify-center w-full max-w-96 lg:w-96 flex flex-col gap-4 md:gap-6 max-lg:pb-6 max-lg:pt-8 mt-auto pr-4">
        <PlanBLogo className="h-auto max-lg:hidden" width={240} />
        {callout ? <PaymentCallout description={callout} /> : null}
        <div className="w-full flex flex-col">
          {splitDescription?.map((desc) => (
            <p className="text-sm mt-3" key={desc}>
              {desc}
            </p>
          ))}
        </div>

        <div className="w-full max-lg:hidden">{displayReductionCode()}</div>

        <div className="flex flex-col w-full gap-2 max-lg:hidden">
          <div className="flex flex-row justify-between w-full">
            <span className="text-lg font-medium">{t('payment.total')}</span>
            <div className="flex flex-col items-end">
              <span className="text-lg font-medium">
                {getFormattedUnit(paidPriceDollars || 0, DEFAULT_CURRENCY, 0)}
              </span>
              <span className="text-sm text-newBlack-5">{satsPrice} sats</span>
            </div>
          </div>
          <Divider mode="light" width="w-full" className="!mx-0" />
          {paidPriceDollars !== 0 && <TaxWarningText />}
        </div>

        <div className="flex flex-col gap-2">
          {/* Todo : a generic component should not reference a specific one */}
          {children}

          {paidPriceDollars !== 0 && <TaxWarningText className="lg:hidden" />}
        </div>

        <div className="w-full lg:hidden">{displayReductionCode()}</div>

        {isGdprCompliance ? (
          <div className="flex self-start space-x-2 w-full relative">
            <Checkbox
              id="terms"
              className="self-start mt-[2px] border-black data-[state=checked]:bg-white"
              checked={isBookEnabled}
              onCheckedChange={(e: boolean) => {
                setIsBookEnabled(e);
                console.log(e);
              }}
            />
            <label htmlFor="terms" className="text-sm">
              <ReactMarkdown
                components={{
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      className=" text-darkOrange-5 "
                      rel="noreferrer"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {gdprTerms}
              </ReactMarkdown>
              <span className="absolute text-red-6 text-sm right-0 top-0">
                *
              </span>
            </label>
          </div>
        ) : null}
        {!isBookEnabled && isBtnClicked ? (
          <p className="text-red-6 text-sm self-start -mt-4">
            {t('events.tcMustBeAccepted')}
          </p>
        ) : null}
        {checkoutError && (
          <span className="text-red-5 text-center whitespace-pre-line">
            {checkoutError}
          </span>
        )}

        <div className="flex flex-col-reverse md:flex-row md:w-full md:justify-center gap-4">
          {paidPriceDollars !== 0 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsBtnClicked(true);
                if (isBookEnabled) {
                  initPayment('stripe');
                }
              }}
            >
              {t('payment.payByCard')}
            </Button>
          )}
          <Button
            variant="primary"
            className={cn(
              paidPriceDollars !== 0 ? 'w-full' : 'min-w-42 md:min-w-47',
            )}
            onClick={() => {
              setIsBtnClicked(true);
              if (isBookEnabled) {
                initPayment('sbp');
              }
            }}
          >
            {t(
              paidPriceDollars !== 0
                ? 'payment.payWithBitcoin'
                : 'words.continue',
            )}
          </Button>
        </div>
      </div>
      <div className="text-center uppercase md:text-xs justify-self-end mt-auto mb-4 md:mb-2">
        <div className="text-[10px] md:text-xs">
          <Trans i18nKey="payment.terms">
            <Link
              to="/public-communication/legals/terms-of-sale"
              className="hover:underline hover:underline-offset-2 text-darkOrange-5"
              target="_blank"
              rel="noreferrer"
            >
              Payment terms
            </Link>
          </Trans>
        </div>
      </div>
    </>
  );
};

const TaxWarningText = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'w-full max-md:text-center md:text-right text-newGray-3 body-14px',
        className,
      )}
    >
      {t('payment.taxesMayApply')}
    </span>
  );
};
