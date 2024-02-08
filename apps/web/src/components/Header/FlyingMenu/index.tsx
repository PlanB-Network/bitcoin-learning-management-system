import { Link } from '@tanstack/react-router';

import PlanBLogo from '../../../assets/planb_logo_horizontal_white.svg?react';
import { MetaElements } from '../MetaElements';
import { NavigationSection } from '../props';

import { FlyingMenuSection } from './FlyingMenuSection';

export interface FlyingMenuProps {
  sections: NavigationSection[];
  onClickLogin: () => void;
  onClickRegister: () => void;
}

export const FlyingMenu = ({
  sections,
  onClickRegister,
  onClickLogin,
}: FlyingMenuProps) => {
  return (
    <nav className="flex w-full flex-row items-center justify-between">
      <Link to="/">
        <PlanBLogo className="h-auto lg:w-32 xl:w-40" />
      </Link>
      <ul className="flex flex-row items-center space-x-5 rounded-2xl bg-white px-8 py-2 text-black lg:space-x-10 ">
        {sections.map((section, index) => (
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
