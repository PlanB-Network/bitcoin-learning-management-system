import { t } from 'i18next';
import { FiLoader } from 'react-icons/fi';

import type { JoinedEvent } from '@sovereign-university/types';
import { Button } from '@sovereign-university/ui';

import { formatDate, formatTime } from '#src/utils/date.js';
import { trpc } from '#src/utils/trpc.js';

import PlanBLogo from '../../../assets/planb_logo_horizontal_black.svg?react';

interface ModalBookSuccessProps {
  event: JoinedEvent;
  accessType: 'physical' | 'online' | 'replay';
  onClose: () => void;
}

export const ModalBookSuccess = ({
  event,
  accessType,
  onClose,
}: ModalBookSuccessProps) => {
  const { data: user } = trpc.user.getDetails.useQuery();

  const { mutateAsync: downloadTicketAsync, isPending } =
    trpc.user.events.downloadEventTicket.useMutation();

  const timezone = event.timezone ? event.timezone : undefined;

  const formattedStartDate = event.startDate ? formatDate(event.startDate) : '';
  const formattedTime =
    event.startDate && event.endDate
      ? `${formatTime(event.startDate, timezone)} ${t('words.to')} ${formatTime(event.endDate, timezone)}`
      : '';
  const formattedCapacity = event.availableSeats
    ? `limited to ${event.availableSeats} people`
    : '';

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
          iconRight={isPending ? <FiLoader /> : undefined}
        >
          {t('events.payment.back_events')}
        </Button>
        {accessType === 'physical' && (
          <Button
            variant="newPrimary"
            onClick={async () => {
              const base64 = await downloadTicketAsync({
                title: event.name ? event.name : '',
                addressLine1: event.addressLine1,
                addressLine2: event.addressLine2,
                addressLine3: event.addressLine3,
                formattedStartDate: formattedStartDate,
                formattedTime: formattedTime,
                liveLanguage: '',
                formattedCapacity: formattedCapacity,
                contact: '',
                userDisplayName: user?.displayName as string,
              });
              const link = document.createElement('a');
              link.href = `data:application/pdf;base64,${base64}`;
              link.download = 'ticket.pdf';
              document.body.append(link);
              link.click();
              link.remove();
            }}
          >
            {t('events.payment.download_ticket')}
          </Button>
        )}
      </div>
    </div>
  );
};
