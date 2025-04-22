import { t } from 'i18next';
import { useContext } from 'react';
import { FiLoader } from 'react-icons/fi';

import type { JoinedEvent } from '@blms/types';
import { Button } from '@blms/ui';

import PlanBLogo from '#src/assets/logo/planb_logo_horizontal_black.svg?react';
import { AppContext } from '#src/providers/context.js';
import { base64ToBlob } from '#src/utils/misc.ts';
import { trpc } from '#src/utils/trpc.js';

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
  const { user } = useContext(AppContext);

  const { mutateAsync: downloadTicketAsync, isPending } =
    trpc.user.events.downloadEventTicket.useMutation();

  return (
    <div className="items-center justify-center w-60 lg:w-96 flex flex-col gap-6">
      <PlanBLogo className="h-auto" width={240} />
      <div className="items-center justify-center flex flex-col gap-6">
        <div className="flex flex-col text-darkOrange-5 text-sm lg:text-xl font-medium leading-relaxed lg:tracking-015px">
          <span className="text-base text-center">
            {t('events.payment.payment_successful')}
          </span>
        </div>
        {(accessType === 'physical' || accessType === 'online') && (
          <div className="flex flex-col gap-4">
            <span className="text-center text-xs lg:text-base">
              {t(`events.payment.access_${accessType}_successful`)}
            </span>

            {event.priceDollars === 0 ? (
              <span className="text-center text-xs lg:text-base">
                {t('events.payment.limitedSeats')}
              </span>
            ) : null}
          </div>
        )}
      </div>

      <div className="flex gap-5">
        <Button
          variant="outline"
          onClick={() => {
            onClose();
          }}
        >
          {t('events.payment.back_events')}
          {isPending ? (
            <span className="ml-3">
              <FiLoader />
            </span>
          ) : null}
        </Button>
        {accessType === 'physical' && (
          <Button
            variant="primary"
            onClick={async () => {
              const base64 = await downloadTicketAsync({
                eventId: event.id,
                userName: user?.username as string,
              });
              const fileName = 'ticket.pdf';
              const blob = base64ToBlob(base64, 'application/pdf');
              const url = window.URL.createObjectURL(blob);

              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', fileName);

              document.body.appendChild(link);

              link.click();

              link.parentNode?.removeChild(link);
              window.URL.revokeObjectURL(url);
            }}
          >
            {t('events.payment.download_ticket')}
          </Button>
        )}
      </div>
    </div>
  );
};
