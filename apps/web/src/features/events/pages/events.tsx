import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { JoinedEvent } from '@sovereign-university/types';

import { AuthModal } from '#src/components/AuthModal/index.js';
import { AuthModalState } from '#src/components/AuthModal/props.js';
import { PageLayout } from '#src/components/PageLayout/index.tsx';
import { useDisclosure } from '#src/hooks/use-disclosure.js';

import { trpc } from '../../../utils/trpc.ts';
import { CurrentEvents } from '../components/current-events.tsx';
import { EventBookModal } from '../components/event-book-modal.tsx';
import { EventPaymentModal } from '../components/event-payment-modal.tsx';
import { EventsGrid } from '../components/events-grid.tsx';
import { EventsPassed } from '../components/events-passed.tsx';

export const Events = () => {
  const { t } = useTranslation();

  const { data: events } = trpc.content.getEvents.useQuery();
  const { data: eventPayments, refetch: refetchEventPayments } =
    trpc.user.events.getEventPayment.useQuery();

  const [paymentModalData, setPaymentModalData] = useState<{
    eventId: string | null;
    satsPrice: number | null;
    accessType: 'physical' | 'online' | 'replay' | null;
  }>({ eventId: null, satsPrice: null, accessType: null });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [conversionRate, setConversionRate] = useState<number | null>(null);

  const { data: session } = trpc.user.getSession.useQuery();
  const isLoggedIn = session !== undefined;

  const payingEvent: JoinedEvent | undefined = events?.find(
    (e) => e.id === paymentModalData.eventId,
  );

  useEffect(() => {
    refetchEventPayments();
  }, [isLoggedIn, refetchEventPayments]);

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
    <PageLayout
      title={t('events.pageTitle')}
      subtitle={t('events.pageSubtitle')}
      description={t('events.pageDescription')}
      maxWidth="max-w-full"
      paddingXClasses="px-0"
    >
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
            satsPrice={paymentModalData.satsPrice}
            isOpen={isPaymentModalOpen}
            onClose={(isPaid) => {
              // TODO trigger add free booked seat logic

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
      <div className="max-w-[1440px] w-full flex flex-col gap-6 px-4 pt-2.5 mx-auto md:gap-[60px] md:px-10 mt-6 md:mt-[60px]">
        {events && (
          <CurrentEvents
            events={events}
            eventPayments={eventPayments}
            conversionRate={conversionRate}
            openAuthModal={openAuthModal}
            isLoggedIn={isLoggedIn}
            setIsPaymentModalOpen={setIsPaymentModalOpen}
            setPaymentModalData={setPaymentModalData}
          />
        )}
        <div className="h-px w-2/5 bg-newBlack-5 mx-auto sm:w-full"></div>
        {events && (
          <EventsGrid
            events={events}
            eventPayments={eventPayments}
            conversionRate={conversionRate}
            openAuthModal={openAuthModal}
            isLoggedIn={isLoggedIn}
            setIsPaymentModalOpen={setIsPaymentModalOpen}
            setPaymentModalData={setPaymentModalData}
          />
        )}
      </div>
      <div>
        {events && (
          <EventsPassed
            events={events}
            eventPayments={eventPayments}
            conversionRate={conversionRate}
            openAuthModal={openAuthModal}
            isLoggedIn={isLoggedIn}
            setIsPaymentModalOpen={setIsPaymentModalOpen}
            setPaymentModalData={setPaymentModalData}
          />
        )}
      </div>
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          initialState={authMode}
        />
      )}
    </PageLayout>
  );
};
