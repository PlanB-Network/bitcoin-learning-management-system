import type {
  QueryObserverResult,
  RefetchOptions,
} from '@tanstack/react-query';
import type { TRPCClientErrorLike } from '@trpc/client';
import { useTranslation } from 'react-i18next';

import type { EventPayment, JoinedEvent } from '@sovereign-university/types';

import { EventCard } from './event-card.tsx';

interface EventsGridProps {
  events: JoinedEvent[];
  eventPayments: EventPayment[] | undefined;
  refetchEventPayments: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<EventPayment[], TRPCClientErrorLike<any>>>;
  openAuthModal: () => void;
  isLoggedIn: boolean;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  conversionRate: number | null;
}

export const EventsGrid = ({
  events,
  eventPayments,
  refetchEventPayments,
  openAuthModal,
  isLoggedIn,
  isPaymentModalOpen,
  setIsPaymentModalOpen,
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
            refetchEventPayments={refetchEventPayments}
            openAuthModal={openAuthModal}
            isLoggedIn={isLoggedIn}
            isPaymentModalOpen={isPaymentModalOpen}
            setIsPaymentModalOpen={setIsPaymentModalOpen}
            conversionRate={conversionRate}
            key={event.name}
          />
        ))}
      </div>
    </div>
  );
};
