import { useTranslation } from 'react-i18next';

import type { JoinedEvent } from '@sovereign-university/types';

import { EventCard } from './event-card.tsx';

interface EventsGridProps {
  events: JoinedEvent[];
  conversionRate: number | null;
}

export const EventsGrid = ({ events, conversionRate }: EventsGridProps) => {
  const { t } = useTranslation();

  const sortedEvents = [...events].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime(),
  );

  return (
    <div className="flex flex-col">
      <h2 className="text-lg font-medium md:text-xl">
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
