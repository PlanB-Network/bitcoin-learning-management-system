import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useTranslation } from 'react-i18next';
import { BsFillHeartFill } from 'react-icons/bs';

import { MainLayout } from '../../../components/MainLayout';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const CourseLayout = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const { t } = useTranslation();

  const isScreenMd = useGreater('sm');

  return (
    <MainLayout>
      <div className="w-full bg-gray-100">
        <div className="text-primary-800 mx-auto flex flex-row items-center justify-center space-x-5 bg-gray-200 px-4 py-1 text-center text-xs font-thin uppercase md:text-sm">
          {isScreenMd && <BsFillHeartFill size={13} />}
          <span>{t('courses.freeBanner')}</span>
          {isScreenMd && <BsFillHeartFill size={13} />}
        </div>
        {children}
      </div>
    </MainLayout>
  );
};
