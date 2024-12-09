import { t } from 'i18next';
import { useContext, useEffect, useState } from 'react';

import type { JoinedEvent } from '@blms/types';

import { AuthModal } from '#src/components/AuthModals/auth-modal.js';
import { AuthModalState } from '#src/components/AuthModals/props.js';
import { useDisclosure } from '#src/hooks/use-disclosure.js';
import { AppContext } from '#src/providers/context.js';
import type { PaymentModalDataModel } from '#src/services/utils.tsx';
import { trpc } from '#src/utils/trpc.js';

import { EventBookModal } from '../../events/-components/event-book-modal.tsx';
import { EventCard } from '../../events/-components/event-card.tsx';
import { EventPaymentModal } from '../../events/-components/event-payment-modal.tsx';

interface BCertificateEventsProps {
  events: JoinedEvent[];
}

export const BCertificateEvents = ({ events }: BCertificateEventsProps) => {
  const { session, conversionRate } = useContext(AppContext);
  const isLoggedIn = !!session;

  const { data: eventPayments, refetch: refetchEventPayments } =
    trpc.user.events.getEventPayment.useQuery(undefined, {
      enabled: isLoggedIn,
    });
  const { data: userEvents, refetch: refetchUserEvents } =
    trpc.user.events.getUserEvents.useQuery(undefined, { enabled: isLoggedIn });

  const [paymentModalData, setPaymentModalData] =
    useState<PaymentModalDataModel>({
      eventId: null,
      satsPrice: null,
      dollarPrice: null,
      accessType: null,
    });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const payingEvent: JoinedEvent | undefined = events?.find(
    (e) => e.id === paymentModalData.eventId,
  );

  const sortedEvents = [...events]
    .filter((event) => {
      const now = Date.now();
      const startDate = event.startDate.getTime();

      return now < startDate;
    })
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  useEffect(() => {
    if (isLoggedIn) {
      refetchEventPayments();
      refetchUserEvents();
    }
  }, [isLoggedIn, refetchEventPayments, refetchUserEvents]);

  // TODO Refactor this auth stuff
  const authMode = AuthModalState.SignIn;

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  // TODO refactor prop drilling
  return (
    <div
      id="bcertevents"
      className="text-white mb-6 md:mb-24 md:scroll-mt-32 scroll-mt-20"
    >
      {paymentModalData.eventId &&
        paymentModalData.satsPrice &&
        paymentModalData.dollarPrice &&
        paymentModalData.accessType &&
        paymentModalData.satsPrice > 0 &&
        payingEvent && (
          <EventPaymentModal
            eventId={paymentModalData.eventId}
            event={payingEvent}
            accessType={paymentModalData.accessType}
            satsPrice={paymentModalData.satsPrice}
            dollarPrice={paymentModalData.dollarPrice}
            isOpen={isPaymentModalOpen}
            onClose={() => {
              refetchEventPayments();
              setPaymentModalData({
                eventId: null,
                satsPrice: null,
                dollarPrice: null,
                accessType: null,
              });
              setIsPaymentModalOpen(false);
            }}
          />
        )}
      {paymentModalData.eventId &&
        paymentModalData.satsPrice === 0 &&
        paymentModalData.accessType &&
        payingEvent && (
          <EventBookModal
            event={payingEvent}
            accessType={paymentModalData.accessType}
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              refetchEventPayments();
              refetchUserEvents();
            }}
          />
        )}

      <div className="flex flex-col">
        <h3 className="mobile-h2 md:desktop-h4 text-center mb-6 md:mb-9">
          {t('bCertificate.bookExam')}
        </h3>
        {sortedEvents.length > 0 && (
          <div className="flex flex-wrap justify-center gap-5 lg:gap-[30px] mx-auto">
            {sortedEvents?.map((event) => (
              <EventCard
                event={event}
                eventPayments={eventPayments}
                userEvents={userEvents}
                openAuthModal={openAuthModal}
                isLoggedIn={isLoggedIn}
                setIsPaymentModalOpen={setIsPaymentModalOpen}
                setPaymentModalData={setPaymentModalData}
                conversionRate={conversionRate}
                key={event.name}
              />
            ))}
          </div>
        )}
        {sortedEvents.length === 0 && (
          <p className="mobile-h4 md:desktop-h5 text-center">
            {t('bCertificate.noBookExam')}
          </p>
        )}
      </div>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          initialState={authMode}
        />
      )}
    </div>
  );
};
