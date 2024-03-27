import { useTranslation } from 'react-i18next';

export const EventsIntroduction = () => {
  const { t } = useTranslation();

  return (
    <section className="text-center max-w-4xl mx-auto">
      <h1 className="text-xs uppercase mb-5 sm:text-base sm:mb-10">
        {t('events.introduction.introductionh1')}
      </h1>
      <p className="text-sm tracking-tight text-newOrange-1 font-semibold mb-2 sm:text-xl">
        {t('events.introduction.introductionp1')}
      </p>
      <p className="text-2xl mb-6 sm:text-[40px]">
        {t('events.introduction.introductionp2')}
      </p>
      <p className="text-sm text-newGray-1 sm:text-base">
        {t('events.introduction.introductionp3')}
      </p>
    </section>
  );
};
