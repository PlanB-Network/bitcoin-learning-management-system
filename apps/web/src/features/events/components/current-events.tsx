import { useTranslation } from 'react-i18next';

import { EventCard } from './event-card.tsx';

export const CurrentEvents = () => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col items-center">
      <h2 className="text-lg text-newOrange-1 font-medium md:text-2xl md:font-normal md:tracking-[0.25px]">
        {t('events.main.currentEvents')}
      </h2>
      <div className="flex flex-wrap justify-center gap-10 mt-[30px] mx-auto sm:p-4 sm:shadow-l-section sm:rounded-[20px] sm:border-2 sm:border-newOrange-1">
        <EventCard isLive={true} />
        <EventCard isLive={true} />
      </div>
    </section>
  );
};
