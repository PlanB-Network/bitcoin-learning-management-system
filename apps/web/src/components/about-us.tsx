import { useTranslation } from 'react-i18next';

import BitcoinCircle from '#src/assets/icons/bitcoin_circle.svg';
import Groups from '#src/assets/icons/groups.svg';
import OpenSource from '#src/assets/icons/open_source.svg';
import VisibilityOff from '#src/assets/icons/visibility_off.svg';
import ProfessorsTile from '../assets/home/professors.webp?no-inline';

const paragraphClassName =
  'text-sm text-gray-400 sm:text-sm lg:text-base mt-2 font-light';

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
          <img src={BitcoinCircle} alt="" />
          <div className="mt-2 text-sm font-semibold md:text-2xl">
            {t('home.aboutUsSection.bitcoinFocusTitle').toUpperCase()}
          </div>
          <div className={paragraphClassName}>
            {t('home.aboutUsSection.bitcoinFocusContent')}
          </div>
        </div>
        <div className="flex max-w-sm flex-col items-center">
          <img src={OpenSource} alt="" />
          <div className="mt-2 text-sm font-semibold md:text-2xl">
            {t('home.aboutUsSection.openSourceTitle').toUpperCase()}
          </div>
          <div className={paragraphClassName}>
            {t('home.aboutUsSection.openSourceContent')}
          </div>
        </div>
        <div className="flex max-w-sm flex-col items-center">
          <img src={Groups} alt="" />
          <div className="mt-2 text-sm font-semibold md:text-2xl">
            {t('home.aboutUsSection.communityTitle').toUpperCase()}
          </div>
          <div className={paragraphClassName}>
            {t('home.aboutUsSection.communityContent')}
          </div>
        </div>
        <div className="flex max-w-sm flex-col items-center">
          <img src={VisibilityOff} alt="" />
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
