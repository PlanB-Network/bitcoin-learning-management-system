import type { JoinedEvent } from '@blms/types';
import { cn } from '@blms/ui';
import { useTranslation } from 'react-i18next';
import { EventCard } from './event-card.tsx';

interface EventsGridProps {
  events: JoinedEvent[];
  hideTitle?: boolean;
}

export const EventsGrid = ({ events, hideTitle = false }: EventsGridProps) => {
  const { t } = useTranslation();

  let upcomingEvents: JoinedEvent[] = [];

  if (events) {
    upcomingEvents = events?.filter((event) => {
      const now = Date.now();
      const startDate = event.startDate.getTime();

      return now < startDate;
    });
  }

  const sortedEvents = [...upcomingEvents].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime(),
  );

  return (
    <div className="flex flex-col">
      {!hideTitle && (
        <h2 className="title-base sm:title-large sm:text-center text-black mt-6">
          {t('events.main.upcomingEvents')}
        </h2>
      )}

      <div
        className={cn(
          'flex flex-wrap justify-center gap-2 lg:gap-6 mx-auto mt-4 sm:mt-6',
        )}
      >
        {sortedEvents?.map((event) => (
          <EventCard event={event} key={event.name} />
        ))}
      </div>
    </div>
  );
};
