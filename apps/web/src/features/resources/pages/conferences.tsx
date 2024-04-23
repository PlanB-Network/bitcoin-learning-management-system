import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { VerticalCard } from '#src/atoms/VerticalCard/index.js';

import mockImg from '../../../assets/events/saif.webp';
import { ConferencesTable } from '../components/Tables/conferences-table.tsx';
import { ConferencesTimeLine } from '../components/Timelines/conferences.tsx';
import { ResourceLayout } from '../layout.tsx';

export const Conferences = () => {
  const [activeYear, setActiveYear] = useState('2024');

  const { t } = useTranslation();

  return (
    <ResourceLayout
      title={t('conferences.pageTitle')}
      tagLine={t('conferences.pageSubtitle')}
      activeCategory="conferences"
      maxWidth="1360"
      className="mx-0 px-0"
    >
      {/* Latest and Plan B Conferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 text-white gap-3 md:gap-7 mx-4">
        <div className="flex flex-col gap-1 md:gap-4 md:col-span-1 xl:col-span-2">
          <h3 className="text-sm md:text-xl md:font-medium leading-snug md:leading-relaxed tracking-[0.17px] md:tracking-[0.15px]">
            {t('conferences.latestConferences')}
          </h3>
          <div className="grid max-md:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-2.5 md:gap-8">
            <VerticalCard
              imageSrc={mockImg}
              title="Test conf"
              subtitle="Test Place"
              buttonText={t('events.card.watchReplay')}
              buttonVariant="newPrimary"
              link="/"
              languages={['EN', 'FR']}
            />
            <div className="size-full bg-red-500 md:hidden xl:block"></div>
          </div>
        </div>
        <div className="flex flex-col gap-1 md:gap-4 md:col-span-1 lg:col-span-2">
          <h3 className="text-sm md:text-xl md:font-medium leading-snug md:leading-relaxed tracking-[0.17px] md:tracking-[0.15px]">
            {t('conferences.planBConferences')}
          </h3>
          <div className="grid max-md:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2.5 md:gap-8">
            <div className="w-full h-60 bg-orange-500"></div>
            <div className="w-full h-60 bg-orange-500 md:hidden lg:block"></div>
          </div>
        </div>
      </div>

      <div className="h-px bg-newBlack-5 md:bg-white/25 mt-3 mb-8 md:mt-10 md:mb-[60px] mx-4" />

      {/* Timeline and table */}
      <div className="flex flex-col justify-center items-center text-center mx-4">
        <h2 className="text-darkOrange-5 text-2xl md:text-[34px] leading-normal md:leading-tight md:tracking-[0.25px]">
          {t('conferences.conferencesSinceGenesis')}
        </h2>
        <p className="text-white leading-[175%] tracking-[0.15px] max-w-[817px] max-md:hidden mt-5">
          {t('conferences.description')}
        </p>
      </div>
      <ConferencesTimeLine
        activeYear={activeYear}
        setActiveYear={setActiveYear}
      />
      <ConferencesTable />
    </ResourceLayout>
  );
};
