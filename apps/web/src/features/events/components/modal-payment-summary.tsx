import { useTranslation } from 'react-i18next';

import type { JoinedEvent } from '@sovereign-university/types';

import { PaymentRow } from '#src/components/payment-row.js';

import leftBackgroundImg from '../../../assets/courses/left-background.png';

const borderClassName = 'border border-gray-400/25 rounded-xl overflow-hidden';

interface ModalPaymentSummaryProps {
  event: JoinedEvent;
}

export const ModalPaymentSummary = ({ event }: ModalPaymentSummaryProps) => {
  const { t } = useTranslation();

  const Separator = () => <div className="w-100 h-px bg-white/10" />;

  return (
    <div className="h-full items-center place-items-center  ">
      <img
        src={leftBackgroundImg}
        alt="left-background"
        className={`hidden lg:block absolute top-0 left-0 h-full w-1/2 object-cover`}
      />
      <div className={`flex items-center justify-center align-middle h-full`}>
        <div
          className={`${borderClassName} relative xl:w-3/4 backdrop-blur-md bg-black/75 p-8`}
        >
          <div className="flex flex-col gap-6">
            <span className="text-base text-white font-medium">
              {event.name}
            </span>
            <div className={`${borderClassName} max-w-[500px]`}>
              {event.assetUrl}
            </div>
            <div>
              <PaymentRow label="pp" value={event.path} />
              <Separator />
              <PaymentRow
                label={t('courses.payment.date')}
                value={t('courses.payment.dates_to', {
                  startDate: event.startDate
                    ? new Date(event.startDate).toLocaleDateString()
                    : '',
                  endDate: event.endDate
                    ? new Date(event.endDate).toLocaleDateString()
                    : '',
                })}
              />
            </div>
            <span className="text-sm text-white">{event.description}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
