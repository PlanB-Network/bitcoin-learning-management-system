import { Link } from '@tanstack/react-router';

import { cn } from '@sovereign-university/ui';

import PlanBLogoOrange from '../../../assets/planb_logo_horizontal_white_orangepill_whitetext.svg?react';
import PlanBLogoWhite from '../../../assets/planb_logo_horizontal_white_whitepill.svg?react';
import { MetaElements } from '../MetaElements/index.tsx';
import type { NavigationSection } from '../props.tsx';

import { FlyingMenuSection } from './FlyingMenuSection/index.tsx';

export interface FlyingMenuProps {
  sections: NavigationSection[];
  onClickLogin: () => void;
  onClickRegister: () => void;
  variant?: 'light' | 'dark';
}

export const FlyingMenu = ({
  sections,
  onClickRegister,
  onClickLogin,
  variant = 'dark',
}: FlyingMenuProps) => {
  return (
    <nav className="flex w-full flex-row items-center justify-between">
      <Link to="/" className="mr-auto">
        {variant === 'light' ? (
          <PlanBLogoWhite className="h-auto lg:w-32 xl:w-40" />
        ) : (
          <PlanBLogoOrange className="h-auto lg:w-32 xl:w-40" />
        )}
      </Link>
      <ul
        className={cn(
          'mx-auto flex flex-row items-center gap-2 xl:gap-5 rounded-xl px-3 py-2.5',
          variant === 'light'
            ? 'bg-darkOrange-4 text-darkOrange-10'
            : 'bg-newBlack-3 text-white',
        )}
      >
        {sections.map((section) => (
          <li key={section.id}>
            <FlyingMenuSection section={section} variant={variant} />
          </li>
        ))}
      </ul>
      <MetaElements
        onClickLogin={onClickLogin}
        onClickRegister={onClickRegister}
        variant={variant}
      />
    </nav>
  );
};
