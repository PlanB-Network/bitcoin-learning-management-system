import { useTranslation } from 'react-i18next';

import type {
  EventPayment,
  JoinedEvent,
  UserEvent,
} from '@sovereign-university/types';

import { EventCard } from './event-card.tsx';

interface EventsGridProps {
  events: JoinedEvent[];
  eventPayments: EventPayment[] | undefined;
  userEvents: UserEvent[] | undefined;
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

export const EventsGrid = ({
  events,
  eventPayments,
  userEvents,
  openAuthModal,
  isLoggedIn,
  setIsPaymentModalOpen,
  setPaymentModalData,
  conversionRate,
}: EventsGridProps) => {
  const { t } = useTranslation();

  let upcomingEvents: JoinedEvent[] = [];

  if (events) {
    upcomingEvents = events?.filter((event) => {
      const now = Date.now();
      const startDate = new Date(event.startDate).getTime();

      return now < startDate;
    });
  }

  const sortedEvents = [...upcomingEvents].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  return (
    <div className="flex flex-col">
      <h2 className="text-lg text-center font-medium sm:text-xl sm:text-left">
        {t('events.main.upcomingEvents')}
      </h2>

      <div className="flex flex-wrap justify-center gap-5 lg:gap-[30px] mt-6 md:mt-12 mx-auto">
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
    </div>
  );
};
