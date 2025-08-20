import { cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import PlanBLogoOrange from '../../../assets/logo/planb_logo_horizontal_white_orangepill_whitetext.svg?react';
import PlanBLogoWhite from '../../../assets/logo/planb_logo_horizontal_white_whitepill.svg?react';
import { isRTL } from '../../../utils/i18n.ts';
import { MetaElements } from '../meta-elements.tsx';
import type { NavigationSection } from '../props.ts';

import { FlyingMenuSection } from './flying-menu-section.tsx';

export interface FlyingMenuProps {
  sections: NavigationSection[];
  onClickLogin: () => void;
  onClickRegister: () => void;
  variant?: 'light' | 'dark';
  notificationPanelVariant?: 'light' | 'dark';
}

export const FlyingMenu = ({
  sections,
  onClickRegister,
  onClickLogin,
  variant = 'dark',
  notificationPanelVariant = 'dark',
}: FlyingMenuProps) => {
  const { i18n } = useTranslation();
  const rtl = isRTL(i18n.language);
  return (
    <nav
      className={cn(
        'flex w-full flex-row items-center justify-between max-lg:hidden',
        rtl && 'flex-row-reverse text-red-5',
      )}
    >
      <Link to="/" className={rtl ? 'ml-auto' : 'mr-auto'}>
        {variant === 'light' ? (
          <PlanBLogoWhite className="h-auto lg:w-32 xl:w-40" />
        ) : (
          <PlanBLogoOrange className="h-auto lg:w-32 xl:w-40" />
        )}
      </Link>
      <ul
        className={cn(
          'flex flex-row items-center gap-2 xl:gap-5 rounded-xl px-3 py-2.5',
          variant === 'light'
            ? 'bg-darkOrange-2 text-black'
            : 'bg-newBlack-3 text-white',
          rtl ? 'text-red-5' : '',
        )}
      >
        {sections.map((section) => (
          <li key={section.id} className={rtl ? 'text-right' : ''}>
            <FlyingMenuSection section={section} variant={variant} rtl={rtl} />
          </li>
        ))}
      </ul>
      <MetaElements
        onClickLogin={onClickLogin}
        onClickRegister={onClickRegister}
        variant={variant}
        notificationPanelVariant={notificationPanelVariant}
      />
    </nav>
  );
};
