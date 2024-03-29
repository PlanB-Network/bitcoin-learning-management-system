import { useTranslation } from 'react-i18next';

import type { JoinedEvent } from '@sovereign-university/types';

import { EventCard } from './event-card.tsx';

interface EventsGridProps {
  events: JoinedEvent[];
  conversionRate: number | null;
}

export const EventsGrid = ({ events, conversionRate }: EventsGridProps) => {
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
            conversionRate={conversionRate}
            key={event.name}
          />
        ))}
      </div>
    </div>
  );
};
