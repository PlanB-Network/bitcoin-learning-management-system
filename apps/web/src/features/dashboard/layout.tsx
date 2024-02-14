import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';

import { MainLayout } from '../../components/MainLayout';

import { MenuDesktop } from './components/menu-desktop';
import { MenuMobile } from './components/menu-mobile';

const { useSmaller } = BreakPointHooks(breakpointsTailwind);

export const DashboardLayout = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const isMobile = useSmaller('md');

  if (isMobile) {
    return (
      <MainLayout showFooter={false}>
        <div>
          <div className="p-6 text-white">{children}</div>
          <MenuMobile />
        </div>
      </MainLayout>
    );
  } else {
    return (
      <MainLayout>
        <div className="flex flex-row text-white">
          <MenuDesktop />
          <div className="bg-dashboardsection ml-4 grow rounded-xl p-10 text-white">
            {children}
          </div>
        </div>
      </MainLayout>
    );
  }
};
