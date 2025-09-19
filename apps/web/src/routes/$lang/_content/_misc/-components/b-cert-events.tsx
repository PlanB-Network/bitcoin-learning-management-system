import type { JoinedEvent } from '@blms/types';
import { t } from 'i18next';
import { EventCard } from '../../events/-components/event-card.tsx';

interface BCertEventsProps {
  events: JoinedEvent[];
}

export const BCertEvents = ({ events }: BCertEventsProps) => {
  const sortedEvents = [...events].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime(),
  );

  return (
    <div
      id="bcertevents"
      className="text-white mb-6 md:mb-24 md:scroll-mt-32 scroll-mt-20"
    >
      <div className="flex flex-col">
        <h3 className="mobile-h2 md:desktop-h4 text-center mb-6 md:mb-14">
          {t('bCert.bookExam')}
        </h3>
        {sortedEvents.length > 0 && (
          <div className="flex flex-wrap justify-center gap-5 lg:gap-7 mx-auto">
            {sortedEvents?.map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </div>
        )}
        {sortedEvents.length === 0 && (
          <p className="mobile-h4 md:desktop-h5 text-center">
            {t('bCert.noBookExam')}
          </p>
        )}
      </div>
    </div>
  );
};
