import type { JoinedEvent } from '@blms/types';
import { t } from 'i18next';
import { EventCard } from '../../events/-components/event-card.js';

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
    <div className="text-white mb-7 md:mb-14">
      <div className="flex flex-col">
        <h3 className="mobile-h3 md:desktop-h4 text-center mb-2.5 md:mb-9">
          {t('projects.relatedEvents')}
        </h3>

        {sortedEvents.length > 0 && (
          <div className="flex flex-wrap justify-center gap-5 lg:gap-7 mx-auto">
            {sortedEvents?.map((event) => (
              <EventCard event={event} key={event.name} />
            ))}
          </div>
        )}
        {sortedEvents.length === 0 && (
          <p className="mobile-h4 md:desktop-h5 text-center">
            {t('projects.noRelatedEvents')}
          </p>
        )}
      </div>
    </div>
  );
};
