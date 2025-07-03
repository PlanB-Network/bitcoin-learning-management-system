import type { EventPayment, JoinedEvent } from '@blms/types';
import { Button } from '@blms/ui';
import { t } from 'i18next';
import { useContext, useState } from 'react';
import { IoMdLock, IoMdUnlock } from 'react-icons/io';

import { AuthModalState } from '#src/components/AuthModals/props.ts';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { useAuthModal } from '#src/providers/auth.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { ConversionRateContext } from '#src/providers/conversionRateContext.tsx';
import type { PaymentModalDataModel } from '#src/services/utils.tsx';
import { EventPaymentModal } from '../../events/-components/event-payment-modal.tsx';

export const LectureBuy = ({
  lecture,
  eventPayment,
  refetchEventPayments,
}: {
  lecture: JoinedEvent;
  eventPayment?: EventPayment;
  refetchEventPayments: () => void;
}) => {
  const { session } = useContext(AppContext);
  const { conversionRate } = useContext(ConversionRateContext);
  const { openAuthModal: openAuthModalContext } = useAuthModal();
  const isLoggedIn = !!session;

  const dollarPrice = lecture.priceDollars;
  let satsPrice =
    conversionRate && dollarPrice !== null
      ? Math.round((dollarPrice * 100_000_000) / conversionRate)
      : -1;
  if (satsPrice > 10 && process.env.NODE_ENV === 'development') {
    satsPrice = 10;
  }

  const [paymentModalData, setPaymentModalData] =
    useState<PaymentModalDataModel>({
      accessType: null,
      dollarPrice: null,
      eventId: null,
      satsPrice: null,
    });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const isMobile = useSmaller('md');

  if (lecture.priceDollars === 0) {
    return null;
  }

  return (
    <div className="md:mt-[18px]">
      {paymentModalData.eventId &&
        paymentModalData.satsPrice &&
        paymentModalData.dollarPrice &&
        paymentModalData.accessType &&
        paymentModalData.satsPrice > 0 && (
          <EventPaymentModal
            eventId={paymentModalData.eventId}
            event={lecture}
            accessType={paymentModalData.accessType}
            satsPrice={paymentModalData.satsPrice}
            dollarPrice={paymentModalData.dollarPrice}
            isOpen={isPaymentModalOpen}
            onClose={() => {
              refetchEventPayments();
              setPaymentModalData({
                accessType: null,
                dollarPrice: null,
                eventId: null,
                satsPrice: null,
              });
              setIsPaymentModalOpen(false);
            }}
          />
        )}
      <div className="flex gap-2 md:gap-[30px] items-center max-md:justify-between">
        <div className="flex max-md:flex-col md:gap-1 text-darkOrange-5 ">
          <span className="body-16px-medium md:title-large-sb-24px">
            ${dollarPrice}
          </span>
          <span className="max-md:hidden title-large-24px">·</span>
          <span className="body-16px md:title-large-24px">
            {satsPrice} sats
          </span>
        </div>
        {eventPayment ? (
          <Button size={isMobile ? 'm' : 'l'} variant="outline" disabled>
            <IoMdUnlock size={24} className="shrink-0 mr-2" />
            {t('events.card.purchased')}
          </Button>
        ) : (
          <Button
            variant="primary"
            size={isMobile ? 'm' : 'l'}
            onClick={() => {
              if (isLoggedIn) {
                setPaymentModalData({
                  accessType: 'online',
                  dollarPrice: dollarPrice,
                  eventId: lecture.id,
                  satsPrice: satsPrice,
                });
                setIsPaymentModalOpen(true);
              } else {
                openAuthModalContext(AuthModalState.SignIn);
              }
            }}
          >
            <IoMdLock size={24} className="shrink-0 mr-2" />
            {t('events.card.buyVideo')}
          </Button>
        )}
      </div>
    </div>
  );
};
