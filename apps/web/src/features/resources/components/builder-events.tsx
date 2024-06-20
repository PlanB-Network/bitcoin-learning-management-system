import { t } from 'i18next';
import { useEffect, useState } from 'react';

import type { JoinedEvent } from '@sovereign-university/types';

import { AuthModal } from '#src/components/AuthModal/index.js';
import { AuthModalState } from '#src/components/AuthModal/props.js';
import { EventBookModal } from '#src/features/events/components/event-book-modal.js';
import { EventCard } from '#src/features/events/components/event-card.js';
import { EventPaymentModal } from '#src/features/events/components/event-payment-modal.js';
import { useDisclosure } from '#src/hooks/use-disclosure.js';

import { trpc } from '../../../utils/index.ts';

interface BuilderEventsProps {
  events: JoinedEvent[];
}

export const BuilderEvents = ({ events }: BuilderEventsProps) => {
  const { data: eventPayments, refetch: refetchEventPayments } =
    trpc.user.events.getEventPayment.useQuery();
  const { data: userEvents, refetch: refetchUserEvents } =
    trpc.user.events.getUserEvents.useQuery();

  const [paymentModalData, setPaymentModalData] = useState<{
    eventId: string | null;
    satsPrice: number | null;
    accessType: 'physical' | 'online' | 'replay' | null;
  }>({ eventId: null, satsPrice: null, accessType: null });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [conversionRate, setConversionRate] = useState<number | null>(null);

  const { data: session } = trpc.user.getSession.useQuery();
  const isLoggedIn = session?.user?.uid !== undefined;

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
    refetchEventPayments();
    refetchUserEvents();
  }, [isLoggedIn, refetchEventPayments, refetchUserEvents]);

  // TODO Refactor this auth stuff
  const authMode = AuthModalState.SignIn;

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  interface MempoolPrice {
    USD: number;
    EUR: number;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('https://mempool.space/api/v1/prices');
        const data = (await response.json()) as MempoolPrice;

        if (data) {
          const newConversionRate = data.USD;
          setConversionRate(newConversionRate);
        } else {
          console.error('Failed to retrieve conversion rate from Kraken API.');
        }
      } catch (error) {
        console.error('Failed to fetch conversion rate:', error);
      }
    }

    fetchData();
  }, []);

  // TODO refactor prop drilling
  return (
    <div className="text-white mb-7 md:mb-32">
      {paymentModalData.eventId &&
        paymentModalData.satsPrice &&
        paymentModalData.accessType &&
        paymentModalData.satsPrice > 0 &&
        payingEvent && (
          <EventPaymentModal
            eventId={paymentModalData.eventId}
            event={payingEvent}
            accessType={paymentModalData.accessType}
            satsPrice={paymentModalData.satsPrice}
            isOpen={isPaymentModalOpen}
            onClose={(isPaid) => {
              // TODO trigger add paid booked seat logic

              if (isPaid) {
                refetchEventPayments();
                setTimeout(() => {
                  refetchEventPayments();
                }, 5000);
              }
              setPaymentModalData({
                eventId: null,
                satsPrice: null,
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
        <h3 className="mobile-h3 md:desktop-h4 text-center mb-2.5 md:mb-9">
          {t('builders.relatedEvents')}
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
            {t('builders.noRelatedEvents')}
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
