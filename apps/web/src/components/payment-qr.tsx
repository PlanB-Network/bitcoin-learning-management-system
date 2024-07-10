import { QRCodeSVG } from 'qrcode.react';
import { Trans, useTranslation } from 'react-i18next';
import { AiOutlineCopy } from 'react-icons/ai';

import { Button, cn } from '@sovereign-university/ui';

import PlanBLogo from '../assets/planb_logo_horizontal_black.svg?react';

export interface PaymentData {
  id: string;
  pr: string;
  onChainAddr: string;
  amount: number;
  checkoutUrl: string;
}

interface PaymentQrProps extends React.HTMLProps<HTMLDivElement> {
  paymentData: PaymentData;
  onBack?: () => void;
}

export const PaymentQr = ({ paymentData, onBack }: PaymentQrProps) => {
  const { t } = useTranslation();
  const borderClassName =
    'border border-[rgba(115,115,115,0.1)] rounded-xl overflow-hidden';
  const invoice = `bitcoin:${paymentData.onChainAddr.toUpperCase()}?amount=${paymentData.amount / 100_000_000}&label=PlanBNetwork&lightning=${paymentData.pr}`;

  const onChain = `bitcoin:${paymentData.onChainAddr.toUpperCase()}?amount=${paymentData.amount / 100_000_000}&label=PlanBNetwork`;
  const lightning = paymentData.pr;

  return (
    <>
      <div className="items-center justify-center w-full max-w-96 lg:w-96 flex flex-col gap-6 md:gap-8 max-lg:pb-6 max-lg:pt-8 mt-auto">
        <PlanBLogo className="h-auto" width={240} />
        <span className="text-center text-xs lg:text-base">
          {t('courses.payment.qr_unified')}
        </span>
        <QRCodeSVG value={invoice} size={220} />
        <div className="flex flex-col max-w-96 lg:w-96 w-full">
          <span className="desktop-h7 text-center mx-auto mb-2">
            {t('words.onChain')}
          </span>
          <div
            className={cn(
              `flex flex-row items-center justify-center px-4 py-3 w-full mb-8 bg-[#E9E9E9]`,
              borderClassName,
            )}
          >
            <span className="desktop-subtitle1 text-newGray-1 flex-1 truncate">
              {onChain}
            </span>
            <AiOutlineCopy
              className="h-5 w-auto cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(onChain);
              }}
            />
          </div>
          <span className="desktop-h7 text-center mx-auto mb-2">
            {t('words.lightning')}
          </span>
          <div
            className={cn(
              `flex flex-row items-center justify-center px-4 py-3 w-full bg-[#E9E9E9]`,
              borderClassName,
            )}
          >
            <span className="desktop-subtitle1 text-newGray-1 flex-1 truncate">
              {lightning}
            </span>
            <AiOutlineCopy
              className="h-5 w-auto cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(lightning);
              }}
            />
          </div>
        </div>
        {onBack && (
          <Button variant="newPrimaryGhost" onClick={onBack}>
            Back
          </Button>
        )}
      </div>
      <div className="text-center uppercase md:text-xs justify-self-end mt-auto  mb-2">
        <p className="mb-2 text-[8px] md:text-[10px]">
          {t('payment.feeDistribution')}
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
    </>
  );
};
