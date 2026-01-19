import { cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import {
  TbLayoutSidebar,
  TbLayoutSidebarLeftExpandFilled,
} from 'react-icons/tb';
import PlanBLogoBlack from '#src/assets/logo/pba-horizontal-black.svg?react';
import { MetaElements } from './meta-elements.tsx';

export interface DesktopMenuProps {
  onClickLogin: () => void;
  onClickRegister: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  navbarTitle?: ReactNode;
}

export const DesktopMenu = ({
  onClickRegister,
  onClickLogin,
  isSidebarOpen,
  setIsSidebarOpen,
  navbarTitle,
}: DesktopMenuProps) => {
  return (
    <nav
      className={cn(
        'flex w-full flex-row items-center max-lg:hidden',
        navbarTitle ? 'gap-[63px]' : 'justify-between',
      )}
    >
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

      {navbarTitle}

      <MetaElements
        onClickLogin={onClickLogin}
        onClickRegister={onClickRegister}
      />
    </nav>
  );
};
