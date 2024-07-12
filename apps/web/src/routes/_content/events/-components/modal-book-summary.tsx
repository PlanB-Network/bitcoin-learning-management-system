import { capitalize } from 'lodash-es';
import { useTranslation } from 'react-i18next';

import type { JoinedEvent } from '@sovereign-university/types';
import { cn } from '@sovereign-university/ui';

import leftBackgroundImg from '#src/assets/courses/left-background.webp';
import { PaymentRow } from '#src/components/payment-row.js';
import { getDateString, getTimeString } from '#src/utils/date.js';

const borderClassName = 'border border-gray-400/25 rounded-xl overflow-hidden';

interface ModalBookSummaryProps {
  event: JoinedEvent;
  accessType: 'physical' | 'online' | 'replay';
  mobileDisplay: boolean;
}

export const ModalBookSummary = ({
  event,
  accessType,
  mobileDisplay,
}: ModalBookSummaryProps) => {
  const { t } = useTranslation();

  const Separator = () => (
    <div className="w-full h-px bg-newGray-4 lg:bg-white/10" />
  );

  const timezone = event.timezone || undefined;
  const startDate = event.startDate;
  const endDate = event.endDate;

  const dateString = getDateString(startDate, endDate, timezone);
  const timeString = getTimeString(startDate, endDate, timezone);

  return (
    <div
      className={cn(
        'flex justify-center items-center lg:p-6 bg-cover bg-center max-lg:!bg-none',
        mobileDisplay ? 'lg:hidden' : 'max-lg:hidden',
      )}
      style={{ backgroundImage: `url(${leftBackgroundImg})` }}
    >
      <div
        className={cn(
          'flex flex-col w-full max-w-[492px] p-2.5 lg:p-[30px] backdrop-blur-md bg-newGray-5 lg:bg-black/75',
          borderClassName,
        )}
      >
        <img
          src={event.picture}
          alt={event.name ? event.name : ''}
          className="rounded-2xl mb-4 object-cover aspect-[432/308] w-full"
        />
        <span className="text-lg lg:text-2xl text-black lg:text-white font-bold leading-snug">
          {event.name}
        </span>
        <span className="text-sm lg:text-base text-black lg:text-white font-medium mt-1">
          {event.builder}
        </span>
        <div className="flex flex-col gap-1 lg:gap-2 mt-1 lg:mt-4">
          <PaymentRow label={t('events.payment.date')} value={dateString} />
          <Separator />
          <PaymentRow label={t('events.payment.time')} value={timeString} />
          <Separator />
          {accessType === 'physical' &&
            (event.addressLine1 ||
              event.addressLine2 ||
              event.addressLine3) && (
              <>
                <PaymentRow
                  label={t('events.payment.address')}
                  value={`${event.addressLine2 ? event.addressLine2 + '\n' : ''}${event.addressLine3 ? event.addressLine3 + '\n' : ''}${event.addressLine1 ? event.addressLine1.toUpperCase() : ''}`}
                />
                <Separator />
              </>
            )}
          <PaymentRow
            label={t('events.payment.language')}
            value={event.languages
              .map((language) => capitalize(language))
              .join(', ')}
          />
          <Separator />
          <PaymentRow
            label={t('events.payment.access_type')}
            value={capitalize(accessType)}
          />
          <Separator />
          <PaymentRow
            label={t('events.payment.limitation')}
            value={
              event.availableSeats && event.availableSeats > 0
                ? `${t('events.payment.max_capacity')} ${event.availableSeats} ${t('events.card.people')}`
                : capitalize(t('events.card.unlimited'))
            }
          />
          <span className="flex items-center justify-center gap-1 w-full px-4 py-2 text-darkOrange-5 lg:text-2xl leading-none bg-white lg:bg-white/10 rounded-lg mt-4">
            <span className="font-semibold uppercase">
              {t('events.card.free')}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
