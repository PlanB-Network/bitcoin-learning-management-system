import { t } from 'i18next';

import { Button } from '@sovereign-university/ui';

import PlanBLogo from '../../../assets/planb_logo_horizontal_black.svg?react';

interface ModalBookSuccessProps {
  accessType: 'physical' | 'online' | 'replay';
  onClose: () => void;
}

export const ModalBookSuccess = ({
  accessType,
  onClose,
}: ModalBookSuccessProps) => {
  return (
    <div className="items-center justify-center w-60 lg:w-96 flex flex-col gap-6">
      <PlanBLogo className="h-auto" width={240} />
      <div className="items-center justify-center flex flex-col gap-6">
        <div className="flex flex-col text-darkOrange-5 text-sm lg:text-xl font-medium leading-relaxed lg:tracking-[0.15px]">
          <span className="text-base text-center">
            {t('events.payment.payment_successful')}
          </span>
          <span className="text-base text-center">
            {t('events.payment.enjoy')}
          </span>
        </div>
        {(accessType === 'physical' || accessType === 'online') && (
          <div className="flex flex-col">
            <span className="text-center text-xs lg:text-base">
              {t(`events.payment.access_${accessType}_successful`)}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-5">
        <Button
          variant="newPrimaryGhost"
          onClick={() => {
            onClose();
          }}
        >
          {t('events.payment.back_events')}
        </Button>
        {accessType === 'physical' && (
          <Button
            variant="newPrimary"
            onClick={() => {
              // TODO trigger download your ticket
              onClose();
            }}
          >
            {t('events.payment.download_ticket')}
          </Button>
        )}
      </div>
    </div>
  );
};
