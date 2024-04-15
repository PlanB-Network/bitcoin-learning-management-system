import { t } from 'i18next';

import { Button } from '@sovereign-university/ui';

import type { PaymentData } from '#src/components/payment-qr.js';
import { PaymentRow } from '#src/components/payment-row.js';
import { formatDate } from '#src/utils/date.js';

import PlanBLogo from '../../../../assets/planb_logo_horizontal_black.svg?react';

interface ModalSuccessProps {
  paymentData: PaymentData;
  onClose: (isPaid?: boolean) => void;
}

export const ModalSuccess = ({ paymentData, onClose }: ModalSuccessProps) => {
  return (
    <div className="items-center justify-center w-60 lg:w-96 flex flex-col gap-6">
      <PlanBLogo className="h-auto" width={240} />
      <div className="items-center justify-center flex flex-col gap-6">
        <span className="text-xl font-semibold text-orange">
          {t('courses.payment.payment_successful')}
        </span>
        <span className="text-base text-center">
          {t('courses.payment.access_invoice')}
        </span>
      </div>
      <span className="text-lg font-medium">
        {t('courses.payment.payment_details')}
      </span>
      <>
        <PaymentRow
          isBlack
          label={t('courses.payment.amount')}
          value={`${paymentData.amount} sats`}
        />
        <PaymentRow
          isBlack
          label={t('courses.payment.date')}
          value={formatDate(new Date())}
        />
        <PaymentRow
          isBlack
          label={t('courses.payment.invoiceId')}
          value={paymentData.id}
        />
      </>
      <Button
        variant="newPrimary"
        className="w-full"
        onClick={() => {
          onClose(true);
        }}
      >
        {t('courses.details.startCourse')}
      </Button>
      <div className="text-[10px] text-center uppercase md:text-xs">
        <span>{t('courses.payment.terms1')} </span>
        <a href={'/terms-and-conditions'} target="_blank" rel="noreferrer">
          <span className="text-orange-500">
            {t('courses.payment.terms2')}{' '}
          </span>
        </a>
        <span>{t('courses.payment.terms3')}</span>
      </div>
    </div>
  );
};
