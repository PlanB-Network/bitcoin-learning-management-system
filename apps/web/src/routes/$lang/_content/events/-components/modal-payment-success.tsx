import { t } from 'i18next';
import { useContext } from 'react';
import { Trans } from 'react-i18next';
import { FiLoader } from 'react-icons/fi';

import type { CheckoutData, JoinedEvent } from '@blms/types';
import { Button } from '@blms/ui';

import { Link } from '@tanstack/react-router';
import PlanBLogo from '#src/assets/logo/planb_logo_horizontal_black.svg?react';
import { PaymentRow } from '#src/components/payment-row.js';
import { AppContext } from '#src/providers/context.js';
import { formatDate } from '#src/utils/date.js';
import { base64ToBlob } from '#src/utils/misc.ts';
import { trpc } from '#src/utils/trpc.js';

interface ModalPaymentSuccessProps {
  event: JoinedEvent;
  paymentData: CheckoutData;
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
          </div>
          {(accessType === 'physical' || accessType === 'online') && (
            <div className="flex flex-col">
              <span className="text-center text-xs lg:text-base">
                {t(`events.payment.access_${accessType}_successful`)}
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
          {paymentData.id && (
            <PaymentRow
              isBlack
              isLabelBold
              label={t('courses.payment.invoiceId')}
              value={
                paymentData.id === 'free' ? t('words.free') : paymentData.id
              }
            />
          )}
        </div>
        <div className="flex gap-5">
          <Button
            variant="outline"
            onClick={() => {
              onClose(true);
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
      <div className="text-center uppercase md:text-xs justify-self-end mt-auto mb-2">
        <div className="text-[10px] md:text-xs">
          <Trans i18nKey="payment.terms">
            <Link
              to="/terms-and-conditions"
              className="hover:underline hover:underline-offset-2 text-darkOrange-5"
              target="_blank"
              rel="noreferrer"
            >
              Payment terms
            </Link>
          </Trans>
        </div>
      </div>
    </>
  );
};
