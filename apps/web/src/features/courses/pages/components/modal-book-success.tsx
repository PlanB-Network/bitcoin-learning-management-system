import { t } from 'i18next';

import { Button } from '@sovereign-university/ui';

import type { TRPCRouterOutput } from '#src/utils/trpc.js';

import PlanBLogo from '../../../../assets/planb_logo_horizontal_black.svg?react';

interface ModalBookSuccessProps {
  course: NonNullable<TRPCRouterOutput['content']['getCourse']>;
  onClose: (isPaid?: boolean) => void;
}

export const ModalBookSuccess = ({
  course,
  onClose,
}: ModalBookSuccessProps) => {
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

      <Button
        variant="newPrimary"
        className="w-full"
        onClick={() => {
          onClose(true);
        }}
      >
        Download ticket
      </Button>
      <div>{course.id}</div>
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
