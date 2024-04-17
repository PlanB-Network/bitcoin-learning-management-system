import { t } from 'i18next';

import type { JoinedEvent } from '@sovereign-university/types';
import { Button } from '@sovereign-university/ui';

import PlanBLogo from '#src/assets/planb_logo_horizontal_black.svg?react';
import { PaymentCallout } from '#src/components/payment-callout.js';

import { ModalBookSummary } from './modal-book-summary.tsx';

interface ModalBookDescriptionProps {
  event: JoinedEvent;
  accessType: 'physical' | 'online' | 'replay';
  callout: string;
  description: string;
  onBooked: () => void;
}

export const ModalBookDescription = ({
  event,
  accessType,
  callout,
  description,
  onBooked,
}: ModalBookDescriptionProps) => {
  const splitDescription =
    description.includes('\n') && description.split('\n');

  return (
    <div className="items-center justify-center w-full max-w-96 lg:w-96 flex flex-col gap-6 max-lg:pb-6 max-lg:pt-8">
      <PlanBLogo className="h-auto max-lg:hidden" width={240} />
      <PaymentCallout description={callout} />
      <div className="w-full flex flex-col">
        {splitDescription ? (
          splitDescription.map((desc) => (
            <p className="text-sm max-lg:text-center" key={desc}>
              {desc}
            </p>
          ))
        ) : (
          <p className="text-sm max-lg:text-center">{description}</p>
        )}
      </div>

      {accessType === 'physical' && (
        <p className="w-full text-sm max-lg:text-center">
          {t('events.payment.additional_free_description')}
        </p>
      )}
      <ModalBookSummary
        event={event}
        accessType={accessType}
        mobileDisplay={true}
      />
      <Button variant="newPrimary" className="lg:w-full" onClick={onBooked}>
        {t('events.payment.book_seat')}
      </Button>
    </div>
  );
};
