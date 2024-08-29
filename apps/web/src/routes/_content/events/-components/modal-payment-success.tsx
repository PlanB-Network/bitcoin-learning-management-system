import { t } from 'i18next';
import { useContext } from 'react';
import { Trans } from 'react-i18next';
import { FiLoader } from 'react-icons/fi';

import type { JoinedEvent } from '@blms/types';
import { Button } from '@blms/ui';

import PlanBLogo from '#src/assets/planb_logo_horizontal_black.svg?react';
import type { PaymentData } from '#src/components/payment-qr.js';
import { PaymentRow } from '#src/components/payment-row.js';
import { AppContext } from '#src/providers/context.js';
import { formatDate } from '#src/utils/date.js';
import { trpc } from '#src/utils/trpc.js';

interface ModalPaymentSuccessProps {
  event: JoinedEvent;
  paymentData: PaymentData;
  accessType: 'physical' | 'online' | 'replay';
  onClose: (isPaid?: boolean) => void;
}

export const ModalPaymentSuccess = ({
  event,
  paymentData,
  accessType,
  onClose,
}: ModalPaymentSuccessProps) => {
  const { user } = useContext(AppContext);

  const { mutateAsync: downloadTicketAsync, isPending } =
    trpc.user.events.downloadEventTicket.useMutation();

  return (
    <>
      <div className="items-center justify-center w-full max-w-96 lg:w-96 flex flex-col gap-6 max-lg:pb-6 max-lg:pt-8 mt-auto">
        <PlanBLogo className="h-auto" width={240} />
        <div className="items-center justify-center flex flex-col gap-6">
          <div className="flex flex-col text-darkOrange-5 text-sm lg:text-xl font-medium leading-relaxed lg:tracking-015px">
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
              <span className="text-center text-xs lg:text-base">
                {t('events.payment.access_invoice')}
              </span>
            </div>
          )}
        </div>
        <span className="text-lg font-medium">
          {t('courses.payment.payment_details')}
        </span>
        <div className="w-full flex flex-col gap-4">
          <PaymentRow
            isBlack
            isLabelBold
            label={t('courses.payment.amount')}
            value={`${paymentData.amount} sats`}
          />
          <PaymentRow
            isBlack
            isLabelBold
            label={t('courses.payment.date')}
            value={formatDate(new Date())}
          />
          <PaymentRow
            isBlack
            isLabelBold
            label={t('courses.payment.invoiceId')}
            value={paymentData.id}
          />
        </div>
        <div className="flex gap-5">
          <Button
            variant="outline"
            onClick={() => {
              onClose(true);
            }}
            iconRight={isPending ? <FiLoader /> : undefined}
          >
            {t('events.payment.back_events')}
          </Button>
          {accessType === 'physical' && (
            <Button
              variant="primary"
              onClick={async () => {
                const base64 = await downloadTicketAsync({
                  eventId: event.id,
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
      <div className="text-center uppercase md:text-xs justify-self-end mt-auto mb-2">
        <div className="text-[10px] md:text-xs">
          <Trans i18nKey="payment.terms">
            <a
              className="underline underline-offset-2 hover:text-darkOrange-5 hover:no-underline"
              href="/terms-and-conditions"
              target="_blank"
              rel="noreferrer"
            >
              Payment terms
            </a>
          </Trans>
        </div>
      </div>
    </>
  );
};
