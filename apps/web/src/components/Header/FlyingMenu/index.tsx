import { Link } from '@tanstack/react-router';
import { t } from 'i18next';

import headerImage from '../../../assets/lapin-diplome.png';
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
        <img
          className="h-10 md:h-12 lg:h-16"
          src={headerImage}
          alt={t('imagesAlt.decouvreBitcoinLogo')}
        />
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
