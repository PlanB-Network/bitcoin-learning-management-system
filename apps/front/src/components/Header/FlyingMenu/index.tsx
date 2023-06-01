import { Link } from 'react-router-dom';

import headerImage from '../../../assets/lapin-diplome.png';
import { Routes } from '../../../types/routes';
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
    <nav className="flex flex-row justify-between items-center w-full">
      <Link to={Routes.Home}>
        <img
          className="h-10 lg:h-16"
          src={headerImage}
          alt="DecouvreBitcoin Logo"
        />
      </Link>

      <ul className="flex flex-row space-x-6 text-white lg:space-x-10">
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
