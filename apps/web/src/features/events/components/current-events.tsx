import { useTranslation } from 'react-i18next';

import type { EventPayment, JoinedEvent } from '@sovereign-university/types';

import { EventCard } from './event-card.tsx';

interface CurrentEventsProps {
  events: JoinedEvent[];
  eventPayments: EventPayment[] | undefined;
  openAuthModal: () => void;
  isLoggedIn: boolean;
  setIsPaymentModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPaymentModalData: React.Dispatch<
    React.SetStateAction<{
      eventId: string | null;
      satsPrice: number | null;
      accessType: 'physical' | 'online' | 'replay' | null;
    }>
  >;
  conversionRate: number | null;
}

export const CurrentEvents = ({
  events,
  eventPayments,
  openAuthModal,
  isLoggedIn,
  setIsPaymentModalOpen,
  setPaymentModalData,
  conversionRate,
}: CurrentEventsProps) => {
  const { t } = useTranslation();

  let liveEvents: JoinedEvent[] = [];

  if (events) {
    liveEvents = events?.filter((event) => {
      const now = Date.now();
      const startDate = new Date(event.startDate).getTime();
      let endDate = new Date(event.endDate).getTime();
      const ONE_HOUR = 60 * 60 * 1000;
      const THIRTY_MINUTES = 30 * 60 * 1000;

      if (new Date(event.endDate).getUTCHours() === 0) {
        const TWENTY_FOUR_HOURS = 24 * ONE_HOUR;
        endDate += TWENTY_FOUR_HOURS;
      }

      return startDate - now < THIRTY_MINUTES && now < endDate + ONE_HOUR;
    });
  }

  if (liveEvents.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col items-center">
      <h2 className="text-lg text-newOrange-1 font-medium md:text-2xl md:font-normal md:tracking-[0.25px]">
        {t('events.main.currentEvents')}
      </h2>
      <div className="flex flex-wrap justify-center gap-10 mt-[30px] mx-auto sm:p-4 sm:shadow-l-section sm:rounded-[20px] sm:border-2 sm:border-newOrange-1">
        {liveEvents?.map((event) => (
          <EventCard
            event={event}
            eventPayments={eventPayments}
            isLive={true}
            openAuthModal={openAuthModal}
            isLoggedIn={isLoggedIn}
            setIsPaymentModalOpen={setIsPaymentModalOpen}
            setPaymentModalData={setPaymentModalData}
            conversionRate={conversionRate}
            key={event.name}
          />
        ))}
      </div>
    </section>
  );
};
