import type { JoinedEvent } from '@blms/types';
import { EmptyState } from '@blms/ui';
import { t } from 'i18next';
import { TbCertificateOff } from 'react-icons/tb';
import { EventCard } from '../../events/-components/event-card.tsx';

interface BCertEventsProps {
  events: JoinedEvent[];
}

export const BCertEvents = ({ events }: BCertEventsProps) => {
  const sortedEvents = [...events].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime(),
  );

  return (
    <div id="bcertevents">
      <div className="flex flex-col gap-2 md:gap-6 mt-10 md:mt-12">
        <h3 className="title-large text-black">{t('bCert.bookExam')}</h3>
        {sortedEvents.length > 0 && (
          <div className="flex flex-col md:flex-row flex-wrap gap-2 lg:gap-4">
            {sortedEvents?.map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </div>
        )}
        {sortedEvents.length === 0 && (
          <EmptyState
            title={t('bCert.noTestSessions')}
            icon={TbCertificateOff}
          />
        )}
      </div>
    </div>
  );
};
