import { Link } from '@tanstack/react-router';
import {
  TbLayoutSidebar,
  TbLayoutSidebarLeftExpandFilled,
} from 'react-icons/tb';
import PlanBLogoBlack from '#src/assets/logo/planb_logo_horizontal_black.svg?react';
import { MetaElements } from './meta-elements.tsx';

export interface DesktopMenuProps {
  onClickLogin: () => void;
  onClickRegister: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const DesktopMenu = ({
  onClickRegister,
  onClickLogin,
  isSidebarOpen,
  setIsSidebarOpen,
}: DesktopMenuProps) => {
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
