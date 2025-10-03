import { Link } from '@tanstack/react-router';

import PlanBLogoOrange from '#src/assets/logo/planb_logo_horizontal_white_orangepill_whitetext.svg?react';
import PlanBLogoWhite from '#src/assets/logo/planb_logo_horizontal_white_whitepill.svg?react';
import { MetaElements } from './meta-elements.tsx';

export interface FlyingMenuProps {
  onClickLogin: () => void;
  onClickRegister: () => void;
  variant?: 'light' | 'dark';
  notificationPanelVariant?: 'light' | 'dark';
}

export const FlyingMenu = ({
  onClickRegister,
  onClickLogin,
  variant = 'dark',
  notificationPanelVariant = 'dark',
}: FlyingMenuProps) => {
  return (
    <nav className="flex w-full flex-row items-center justify-between max-lg:hidden">
      <Link to="/" className="mr-auto">
        {variant === 'light' ? (
          <PlanBLogoWhite className="h-auto lg:w-32 xl:w-40" />
        ) : (
          <PlanBLogoOrange className="h-auto lg:w-32 xl:w-40" />
        )}
      </Link>

      <MetaElements
        onClickLogin={onClickLogin}
        onClickRegister={onClickRegister}
        variant={variant}
        notificationPanelVariant={notificationPanelVariant}
      />
    </nav>
  );
};
