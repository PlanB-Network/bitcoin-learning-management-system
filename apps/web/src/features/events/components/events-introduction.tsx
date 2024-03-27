import { useTranslation } from 'react-i18next';

export const EventsIntroduction = () => {
  const { t } = useTranslation();

  return (
    <section className="text-center max-w-[880px] mx-auto">
      <h1 className="text-xs uppercase mb-5 sm:text-base sm:mb-10">
        {t('events.introduction.introductionh1')}
      </h1>
      <p className="text-sm tracking-[-3%] text-newOrange-1 font-semibold mb-2 sm:text-xl sm:tracking-normal">
        {t('events.introduction.introductionp1')}
      </p>
      <p className="text-2xl mb-6 sm:text-[40px] sm:tracking-[0.25px]">
        {t('events.introduction.introductionp2')}
      </p>
      <p className="text-sm text-newGray-1 tracking-[0.15px] sm:text-base">
        {t('events.introduction.introductionp3')}
      </p>
    </section>
  );
};
