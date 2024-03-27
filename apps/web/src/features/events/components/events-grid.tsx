import { useTranslation } from 'react-i18next';

import { EventCard } from './event-card.tsx';

export const EventsGrid = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <h2 className="text-xl font-medium">{t('events.main.upcomingEvents')}</h2>
      <div className="flex flex-wrap justify-center gap-5 md:gap-[30px] mt-6 md:mt-12 mx-auto">
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
