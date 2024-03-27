import { useTranslation } from 'react-i18next';

import { EventCard } from './event-card.tsx';

export const EventsGrid = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <h2 className="text-lg font-medium md:text-xl">
        {t('events.main.upcomingEvents')}
      </h2>
      <div className="flex flex-wrap justify-center gap-5 lg:gap-[30px] mt-6 md:mt-12 mx-auto">
        <EventCard />
        <EventCard />
        <EventCard />
        <EventCard />
        <EventCard />
        <EventCard />
      </div>
    </div>
  );
};
