import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { AiOutlineCopy } from 'react-icons/ai';

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
}

export const PaymentQr = ({ paymentRequest }: PaymentQrProps) => {
  const { t } = useTranslation();
  const borderClassName =
    'border border-gray-400/25 rounded-xl overflow-hidden';

  return (
    <div className="items-center justify-center w-60 lg:w-96 flex flex-col gap-6">
      <PlanBLogo className="h-auto" width={240} />
      <QRCodeSVG value={`lightning:${paymentRequest}`} size={220} />
      <div
        className={`${borderClassName} flex flex-row px-4 py-3 relative w-full`}
      >
        <span className="text-base flex-1 truncate">{paymentRequest}</span>
        <AiOutlineCopy
          className="text-blue-1000 h-7 w-auto cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(paymentRequest);
          }}
        />
      </div>
      <div className="text-[10px] text-center uppercase md:text-xs">
        <span>{t('payment.feeDistribution')} </span>
      </div>
    </div>
  );
};
