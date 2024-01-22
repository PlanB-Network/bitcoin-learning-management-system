import { useTranslation } from 'react-i18next';

import { MainLayout } from '../../components/MainLayout';

export const CourseLayout = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const { t } = useTranslation();

  return (
    <MainLayout>
      <div className="w-full bg-gray-100">
        <div className="m-auto flex flex-row items-center justify-center space-x-5 bg-gray-200 px-4 py-1 text-center text-xs font-light uppercase text-blue-800 sm:text-sm">
          <span className="h-full">{t('courses.freeBanner')}</span>
        </div>
        {children}
      </div>
    </MainLayout>
  );
};
