import { Link } from '@tanstack/react-router';
import {
  TbLayoutSidebar,
  TbLayoutSidebarLeftExpandFilled,
} from 'react-icons/tb';
import PlanBLogoBlack from '../../../assets/logo/planb_logo_horizontal_black.svg?react';
import { MetaElements } from '../meta-elements.tsx';
import type { NavigationSection } from '../props.ts';

export interface FlyingMenuProps {
  sections: NavigationSection[];
  onClickLogin: () => void;
  onClickRegister: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const FlyingMenu = ({
  onClickRegister,
  onClickLogin,
  isSidebarOpen,
  setIsSidebarOpen,
}: FlyingMenuProps) => {
  const { i18n } = useTranslation();
  const rtl = isRTL(i18n.language);
  return (
    <nav className="flex w-full flex-row items-center justify-between max-lg:hidden">
      <div className="flex items-center gap-4 px-4 py-3">
        {isSidebarOpen ? (
          <TbLayoutSidebar
            size={24}
            className="text-[#ACACAC] cursor-pointer"
            onClick={() => setIsSidebarOpen(false)}
          />
        ) : (
          <TbLayoutSidebarLeftExpandFilled
            size={24}
            className="text-[#ACACAC] cursor-pointer"
            onClick={() => setIsSidebarOpen(true)}
          />
        )}
        <Link to="/">
          <PlanBLogoBlack className="h-auto w-31" />
        </Link>
      </div>

      <MetaElements
        onClickLogin={onClickLogin}
        onClickRegister={onClickRegister}
      />
    </nav>
  );
};
