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
  paymentRequest: string;
  onBack?: () => void;
}

export const PaymentQr = ({ paymentRequest, onBack }: PaymentQrProps) => {
  const { t } = useTranslation();
  const borderClassName =
    'border border-gray-400/25 rounded-xl overflow-hidden';

  return (
    <>
      <div className="items-center justify-center w-full max-w-96 lg:w-96 flex flex-col gap-6 max-lg:pb-6 max-lg:pt-8 mt-auto">
        <PlanBLogo className="h-auto" width={240} />
        <span className="text-center text-xs lg:text-base">
          {t('courses.payment.qr_unified')}
        </span>
        <QRCodeSVG value={`lightning:${paymentRequest}`} size={220} />
        <div
          className={cn(
            `flex flex-row items-center justify-center px-4 py-3 relative w-full`,
            borderClassName,
          )}
        >
          <span className="text-base flex-1 truncate">{paymentRequest}</span>
          <AiOutlineCopy
            className="text-blue-1000 h-7 w-auto cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(paymentRequest);
            }}
          />
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
