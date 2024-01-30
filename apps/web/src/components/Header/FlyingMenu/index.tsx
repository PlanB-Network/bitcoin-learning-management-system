import { Link } from '@tanstack/react-router';

import PlanBLogo from '../../../assets/planb_logo_vertical_white.svg?react';
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
        <PlanBLogo className="h-auto md:w-20 lg:w-24 xl:w-32" />
      </Link>
      <ul className="flex flex-row items-center space-x-5 text-white lg:space-x-10">
        {sections.map((section, index) => (
          <li className="font-primary" key={section.id}>
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
