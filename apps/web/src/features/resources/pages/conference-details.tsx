import { t } from 'i18next';

import { NewTag } from '#src/atoms/Tag/index.js';

import mockImg from '../../../assets/events/saif.webp';
import { ResourceLayout } from '../layout.tsx';

export const Conference = () => {
  return (
    <ResourceLayout
      title={t('conferences.pageTitle')}
      tagLine={t('conferences.pageSubtitle')}
      activeCategory="conferences"
      maxWidth="1360"
    >
      <div className="flex flex-col md:flex-row justify-center items-center w-full">
        <img
          src={mockImg}
          alt="Conference"
          className="md:order-2 w-full object-cover aspect-[915/388] rounded-2xl"
        />
        <div className="md:w-full md:max-w-[560px] md:order-1 text-white">
          <h2 className="text-white text-[40px] leading-tight tracking-[0.25px]">
            Adopting Bitcoin 2018
          </h2>
          <span className="text-newGray-4 md:desktop-h8">
            City, Country, Month
          </span>
          <div className="flex flex-wrap gap-4 mt-8">
            <NewTag>General</NewTag>
            <NewTag>Lightning Network</NewTag>
            <NewTag>Lightning Network</NewTag>
            <NewTag>Humanitarian</NewTag>
          </div>
          <p className="max-md:hidden md:desktop-body1 text-newGray-1 mt-8">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officia,
            unde cumque esse facere id quas consequuntur iste ea accusantium
            saepe tempora quae quidem quis fuga eaque minus et doloribus
            adipisci?
          </p>
        </div>
      </div>
    </ResourceLayout>
  );
};
