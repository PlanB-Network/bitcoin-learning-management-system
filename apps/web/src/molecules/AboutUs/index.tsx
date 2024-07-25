import { useTranslation } from 'react-i18next';

import { cn } from '@blms/ui';

import ProfessorsTile from '../../assets/home/professors.webp';
import BitcoinCircle from '../../assets/icons/bitcoin_circle.svg?react';
import Groups from '../../assets/icons/groups.svg?react';
import OpenSource from '../../assets/icons/open_source.svg?react';
import VisibilityOff from '../../assets/icons/visibility_off.svg?react';

const paragraphClassName = cn(
  'text-sm text-gray-400 sm:text-sm lg:text-base',
  'mt-2 font-light',
);

export const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <>
      <img
        src={ProfessorsTile}
        className="mt-4 w-full 2xl:px-28"
        alt={t('')}
        loading="lazy"
      />
      <div className="-mt-9 flex flex-col items-center gap-6 text-center md:flex-row">
        <div className="flex max-w-sm flex-col items-center">
          <BitcoinCircle />
          <div className="mt-2 text-sm font-semibold md:text-2xl">
            {t('home.aboutUsSection.bitcoinFocusTitle').toUpperCase()}
          </div>
          <div className={paragraphClassName}>
            {t('home.aboutUsSection.bitcoinFocusContent')}
          </div>
        </div>
        <div className="flex max-w-sm flex-col items-center">
          <OpenSource />
          <div className="mt-2 text-sm font-semibold md:text-2xl">
            {t('home.aboutUsSection.openSourceTitle').toUpperCase()}
          </div>
          <div className={paragraphClassName}>
            {t('home.aboutUsSection.openSourceContent')}
          </div>
        </div>
        <div className="flex max-w-sm flex-col items-center">
          <Groups />
          <div className="mt-2 text-sm font-semibold md:text-2xl">
            {t('home.aboutUsSection.communityTitle').toUpperCase()}
          </div>
          <div className={paragraphClassName}>
            {t('home.aboutUsSection.communityContent')}
          </div>
        </div>
        <div className="flex max-w-sm flex-col items-center">
          <VisibilityOff />
          <div className="mt-2 text-sm font-semibold md:text-2xl">
            {t('home.aboutUsSection.privacyTitle').toUpperCase()}
          </div>
          <div className={paragraphClassName}>
            {t('home.aboutUsSection.privacyContent')}
          </div>
        </div>
      </div>
    </>
  );
};
