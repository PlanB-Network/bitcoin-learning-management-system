import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';

import { MainLayout } from '../../components/MainLayout/index.tsx';

import { MenuDesktop } from './components/menu-desktop.tsx';
import { MenuMobile } from './components/menu-mobile.tsx';

const { useSmaller } = BreakPointHooks(breakpointsTailwind);

export const DashboardLayout = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const isMobile = useSmaller('md');

  return isMobile ? (
    <MainLayout
      variant="light"
      showFooter={false}
      fillScreen={true}
      headerVariant="light"
    >
      <div>
        <div className="p-6 bg-white text-black">{children}</div>
        <MenuMobile />
      </div>
    </MainLayout>
  ) : (
    <MainLayout variant="light" headerVariant="light">
      <div className="flex flex-row text-white min-h-[1012px] mt-3 mx-4 min-[1750px]:max-w-[1700px] min-[1750px]:mx-auto">
        <MenuDesktop />
        <div className="bg-white grow rounded-xl ml-3 p-10 text-black">
          {children}
        </div>
      </div>
    </MainLayout>
  );
};
