import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AuthModal } from '#src/components/AuthModal/index.js';
import { AuthModalState } from '#src/components/AuthModal/props.js';
import { PageLayout } from '#src/components/PageLayout/index.tsx';
import { useAppSelector } from '#src/hooks/use-app-selector.js';
import { useDisclosure } from '#src/hooks/use-disclosure.js';

import { trpc } from '../../../utils/trpc.ts';
import { CurrentEvents } from '../components/current-events.tsx';
import { EventsGrid } from '../components/events-grid.tsx';
import { EventsPassed } from '../components/events-passed.tsx';

export const Events = () => {
  const { t } = useTranslation();

  const { data: events } = trpc.content.getEvents.useQuery();
  const { data: eventPayments, refetch: refetchEventPayments } =
    trpc.user.events.getEventPayment.useQuery();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [conversionRate, setConversionRate] = useState<number | null>(null);

  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

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

  return (
    <PageLayout
      title={t('events.pageTitle')}
      subtitle={t('events.pageSubtitle')}
      description={t('events.pageDescription')}
      maxWidth="max-w-full"
      paddingXClasses="px-0"
    >
      <div className="max-w-[1440px] w-full flex flex-col gap-6 px-4 pt-2.5 mx-auto md:gap-[60px] md:px-10 mt-6 md:mt-[60px]">
        {events && (
          <CurrentEvents
            events={events}
            eventPayments={eventPayments}
            refetchEventPayments={refetchEventPayments}
            conversionRate={conversionRate}
            openAuthModal={openAuthModal}
            isLoggedIn={isLoggedIn}
            isPaymentModalOpen={isPaymentModalOpen}
            setIsPaymentModalOpen={setIsPaymentModalOpen}
          />
        )}
        <div className="h-px w-2/5 bg-newBlack-5 mx-auto sm:w-full"></div>
        {events && (
          <EventsGrid
            events={events}
            eventPayments={eventPayments}
            refetchEventPayments={refetchEventPayments}
            conversionRate={conversionRate}
            openAuthModal={openAuthModal}
            isLoggedIn={isLoggedIn}
            isPaymentModalOpen={isPaymentModalOpen}
            setIsPaymentModalOpen={setIsPaymentModalOpen}
          />
        )}
      </div>
      <div>
        {events && (
          <EventsPassed
            events={events}
            eventPayments={eventPayments}
            refetchEventPayments={refetchEventPayments}
            conversionRate={conversionRate}
            openAuthModal={openAuthModal}
            isLoggedIn={isLoggedIn}
            isPaymentModalOpen={isPaymentModalOpen}
            setIsPaymentModalOpen={setIsPaymentModalOpen}
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
