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
      <Link to="/">
        {variant === 'light' ? (
          <PlanBLogoWhite className="h-auto lg:w-32 xl:w-40" />
        ) : (
          <PlanBLogoOrange className="h-auto lg:w-32 xl:w-40" />
        )}
      </Link>
      <ul
        className={cn(
          'absolute left-1/2 top-1/2 ml-auto flex -translate-x-1/2 -translate-y-1/2 flex-row items-center space-x-5 rounded-2xl px-8 py-2 lg:space-x-10',
          variant === 'light'
            ? 'bg-white/15 text-white'
            : 'bg-white text-black',
        )}
      >
        {sections.map((section) => (
          <li key={section.id}>
            <FlyingMenuSection section={section} />
          </li>
        ))}
      </ul>
      <MetaElements
        onClickLogin={onClickLogin}
        onClickRegister={onClickRegister}
      />
    </nav>
  );
};
