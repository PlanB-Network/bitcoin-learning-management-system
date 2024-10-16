import { createFileRoute } from '@tanstack/react-router';
import React, { Suspense, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { JoinedEvent } from '@blms/types';
import { Loader } from '@blms/ui';

import { AuthModal } from '#src/components/AuthModals/auth-modal.js';
import { AuthModalState } from '#src/components/AuthModals/props.js';
import { PageLayout } from '#src/components/page-layout.js';
import { useDisclosure } from '#src/hooks/use-disclosure.js';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';

import { CurrentEvents } from './-components/current-events.tsx';
import { EventBookModal } from './-components/event-book-modal.tsx';
import { EventPaymentModal } from './-components/event-payment-modal.tsx';
import { EventsGrid } from './-components/events-grid.tsx';
import { EventsPassed } from './-components/events-passed.tsx';

// eslint-disable-next-line import/no-named-as-default-member
const EventsMap = React.lazy(() => import('./-components/events-map.tsx'));

export const Route = createFileRoute('/_content/events/')({
  component: Events,
});

function Events() {
  const { t } = useTranslation();

  const { session } = useContext(AppContext);
  const isLoggedIn = !!session;

  const queryOpts = {
    staleTime: 600_000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  };

  const { data: events, isFetched } = trpc.content.getRecentEvents.useQuery(
    undefined,
    queryOpts,
  );
  const { data: eventPayments, refetch: refetchEventPayments } =
    trpc.user.events.getEventPayment.useQuery(undefined, {
      ...queryOpts,
      enabled: isLoggedIn,
    });
  const { data: userEvents, refetch: refetchUserEvents } =
    trpc.user.events.getUserEvents.useQuery(undefined, {
      ...queryOpts,
      enabled: isLoggedIn,
    });

  const [paymentModalData, setPaymentModalData] = useState<{
    eventId: string | null;
    satsPrice: number | null;
    accessType: 'physical' | 'online' | 'replay' | null;
  }>({ eventId: null, satsPrice: null, accessType: null });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [conversionRate, setConversionRate] = useState<number | null>(null);

  const payingEvent: JoinedEvent | undefined = events?.find(
    (e) => e.id === paymentModalData.eventId,
  );

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
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              refetchEventPayments();
              refetchUserEvents();
            }}
          />
        )}
      <div className="max-w-[1440px] w-full flex flex-col gap-6 px-4 pt-2.5 mx-auto md:gap-[60px] md:px-10 mt-6 md:mt-[60px]">
        {!isFetched && <Loader size={'s'} />}
        {events && (
          <CurrentEvents
            events={events}
            eventPayments={eventPayments}
            userEvents={userEvents}
            conversionRate={conversionRate}
            openAuthModal={openAuthModal}
            isLoggedIn={isLoggedIn}
            setIsPaymentModalOpen={setIsPaymentModalOpen}
            setPaymentModalData={setPaymentModalData}
            headingColor="text-darkOrange-5"
            headingText={t('events.main.currentEvents')}
            headingClass="text-lg  font-medium md:text-2xl md:font-normal md:tracking-[0.25px] "
          />
        )}

        {events && (
          <>
            <Suspense fallback={<Loader size={'s'} />}>
              <EventsMap
                events={events}
                eventPayments={eventPayments}
                userEvents={userEvents}
                conversionRate={conversionRate}
                openAuthModal={openAuthModal}
                isLoggedIn={isLoggedIn}
                setIsPaymentModalOpen={setIsPaymentModalOpen}
                setPaymentModalData={setPaymentModalData}
              />
            </Suspense>

            <EventsGrid
              events={events}
              eventPayments={eventPayments}
              userEvents={userEvents}
              conversionRate={conversionRate}
              openAuthModal={openAuthModal}
              isLoggedIn={isLoggedIn}
              setIsPaymentModalOpen={setIsPaymentModalOpen}
              setPaymentModalData={setPaymentModalData}
            />
          </>
        )}
        <div className="h-px w-2/5 bg-newBlack-5 mx-auto sm:w-full"></div>
        {/* Add my event */}
        <div className="flex flex-col justify-center items-center max-sm:p-4 p-0 max-sm:border max-sm:border-darkOrange-5 max-sm:rounded-2xl max-w-2xl mx-auto">
          <p className="text-darkOrange-5 text-center text-xl font-semibold leading-tight max-sm:hidden mb-2">
            {t('events.newEvent.subtitle')}
          </p>
          <h2 className="text-darkOrange-5 sm:text-white text-2xl sm:text-[40px] text-center font-medium sm:font-normal leading-tight sm:tracking-[0.25px] mb-6 sm:mb-2">
            {t('events.newEvent.title')}
          </h2>
          <p className="text-white text-center sm:text-xl sm:leading-snug max-sm:tracking-015px mb-6 sm:mb-10">
            {t('events.newEvent.description')}
          </p>
          <a
            className="px-[10px] sm:px-[18px] py-[14px] bg-darkOrange-5 text-white rounded-md sm:rounded-2xl flex justify-center items-center sm:text-xl sm:leading-normal font-medium active:scale-95"
            href="https://workspace.planb.network/apps/forms/s/AdXeMipQ7xrrXNyrtyZ2sCLs"
            target="_blank"
            rel="noreferrer"
          >
            {t('events.newEvent.button')}
          </a>
        </div>
      </div>

      <div>
        {!isFetched && <Loader size={'s'} />}
        {events && (
          <EventsPassed
            events={events}
            eventPayments={eventPayments}
            userEvents={userEvents}
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
}
