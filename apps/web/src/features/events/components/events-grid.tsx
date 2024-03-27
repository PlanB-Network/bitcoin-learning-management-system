import { useTranslation } from 'react-i18next';

import { EventCard } from './event-card.tsx';

export const EventsGrid = () => {
  const { t } = useTranslation();

  return (
    <>
      <h2 className="text-xl font-medium mt-4">
        {t('events.main.upcomingEvents')}
      </h2>

      <div className="flex flex-wrap justify-center gap-5 md:gap-[30px] mt-6 md:mt-12 mx-auto">
        <EventCard />
        <EventCard />
        <EventCard />
        <EventCard />
        <EventCard />
        <EventCard />
      </div>
    </>
  );
};
