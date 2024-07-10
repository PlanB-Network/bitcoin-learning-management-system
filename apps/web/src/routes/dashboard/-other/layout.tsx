import { useSmaller } from '#src/hooks/use-smaller.js';

import { MenuDesktop } from '../-components/menu-desktop.tsx';
import { MenuMobile } from '../-components/menu-mobile.tsx';
import { MainLayout } from '../../../components/MainLayout/index.tsx';

export const DashboardLayout = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const isMobile = useSmaller('lg');

  return isMobile ? (
    <MainLayout
      variant="light"
      showFooter={false}
      fillScreen={true}
      headerVariant="light"
    >
      <div>
        <div className="p-6 pb-20 bg-white text-black">{children}</div>
        <MenuMobile />
      </div>
    </MainLayout>
  ) : (
    <MainLayout variant="light" headerVariant="light">
      <div className="flex flex-row text-white min-h-[1012px] mt-3 mx-4">
        <MenuDesktop />
        <div className="bg-white grow rounded-xl ml-3 p-8 text-black">
          {children}
        </div>
      </div>
    </MainLayout>
  );
};
