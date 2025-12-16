import type { JoinedEvent } from '@blms/types';
import { EmptyState } from '@blms/ui';
import { t } from 'i18next';
import { TbCalendarEvent } from 'react-icons/tb';
import { EventCard } from '#src/routes/$lang/events/-components/event-card.tsx';

interface ProjectEventsProps {
  events: JoinedEvent[];
}

export const ProjectEvents = ({ events }: ProjectEventsProps) => {
  const sortedEvents = [...events]
    .filter((event) => {
      const now = Date.now();
      const startDate = event.startDate.getTime();

      return now < startDate;
    })
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  return (
    <div className="flex flex-col gap-1 md:gap-7.5 mt-6 md:mt-13.5">
      <span className="subtitle-base md:title-large">
        {t('projects.relatedEvents')}
      </span>

      {sortedEvents.length > 0 && (
        <div className="flex flex-wrap gap-2 lg:gap-6">
          {sortedEvents?.map((event) => (
            <EventCard event={event} key={event.name} />
          ))}
        </div>
      )}
      {sortedEvents.length === 0 && (
        <EmptyState
          title={t('projects.noRelatedEvents')}
          icon={TbCalendarEvent}
        />
      )}
    </div>
  );
};
