import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaBars } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import headerImage from '../../../assets/lapin-diplome.png';
import { useDisclosure } from '../../../hooks';
import { Routes } from '../../../types/routes';
import { compose } from '../../../utils';
import { MetaElements } from '../MetaElements';
import { NavigationSection } from '../props';

import { MobileMenuSection } from './MobileMenuSection';

export interface MobileMenuProps {
  sections: NavigationSection[];
  onClickLogin: () => void;
  onClickRegister: () => void;
}

export const MobileMenu = ({
  sections,
  onClickLogin,
  onClickRegister,
}: MobileMenuProps) => {
  const { t } = useTranslation();
  const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu } =
    useDisclosure();

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  });

  return (
    <>
      <div className="flex w-full flex-row justify-center">
        <Link className="justify-center" to={Routes.Home}>
          <img
            className="h-10 lg:h-16"
            src={headerImage}
            alt={t('imagesAlt.decouvreBitcoinLogo')}
          />
        </Link>
      </div>
      <FaBars
        className={compose(
          'absolute z-40 cursor-pointer left-[6vw] text-white',
          isMobileMenuOpen ? 'rotate-90' : 'rotate-0'
        )}
        style={{
          transition: 'transform 0.4s, color 0.2s',
        }}
        size={30}
        color="#fff"
        onClick={toggleMobileMenu}
      />
      <nav
        className={compose(
          'flex fixed top-0 left-0 flex-col items-center px-2 pt-28 pb-5 w-screen h-full bg-primary-900 duration-300',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <ul className="my-0 flex-1 list-none space-y-6 overflow-auto pl-10">
          {sections.map((section) => (
            <MobileMenuSection section={section} key={section.id} />
          ))}
        </ul>

        <MetaElements
          onClickLogin={onClickLogin}
          onClickRegister={onClickRegister}
        />
      </nav>
    </>
  );
};
