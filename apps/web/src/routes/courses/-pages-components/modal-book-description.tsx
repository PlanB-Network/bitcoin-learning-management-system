import { t } from 'i18next';

import { Button } from '@sovereign-university/ui';

import PlanBLogo from '#src/assets/planb_logo_horizontal_black.svg?react';
import { PaymentCallout } from '#src/components/payment-callout.js';

interface ModalBookDescriptionProps {
  callout: string;
  description: string;
  onBooked: () => void;
  children?: JSX.Element | JSX.Element[];
}

export const ModalBookDescription = ({
  callout,
  description,
  onBooked,
  children,
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
      {children}
      <Button variant="newPrimary" className="lg:w-full" onClick={onBooked}>
        {t('events.payment.book_seat')}
      </Button>
    </div>
  );
};
