import { useTranslation } from 'react-i18next';

export const Manifesto = () => {
  const { t } = useTranslation();

  return (
    // <MainLayout footerVariant="dark">
    <div className="bg-blue-900 flex justify-center py-10 md:py-20">
      <div className="font-body mx-4 whitespace-pre-line border-r-8 border-t-8 border-orange-500 bg-white px-8 pb-24 pt-6 text-left md:mx-0 md:max-w-2xl md:px-20 md:pt-14 lg:max-w-3xl">
        {t(`about.manifesto`)}
      </div>
    </div>
    // </MainLayout>
  );
};
