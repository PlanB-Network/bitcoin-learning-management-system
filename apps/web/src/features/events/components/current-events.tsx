import { useTranslation } from 'react-i18next';

export const CurrentEvents = () => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col items-center">
      <h2 className="text-lg text-newOrange-1 font-medium md:text-2xl md:font-normal md:tracking-[0.25px]">
        {t('events.main.currentEvents')}
      </h2>
    </section>
  );
};
