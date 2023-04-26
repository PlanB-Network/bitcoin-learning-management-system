import { FaBars } from 'react-icons/fa';

import { useDisclosure } from '../../../hooks';
import { NavigationSection } from '../props';

import { listContainer, menuIcon, navContainer } from './index.css';
import { MobileMenuSection } from './MobileMenuSection';

export interface MobileMenuProps {
  sections: NavigationSection[];
}

export const MobileMenu = ({ sections }: MobileMenuProps) => {
  const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu } =
    useDisclosure();

  return (
    <>
      <FaBars
        className={menuIcon}
        style={{
          transform: isMobileMenuOpen ? 'rotateZ(90deg)' : 'rotateZ(0)',
          color: isMobileMenuOpen
            ? 'var(--primary-color)'
            : 'var(--surface-100)',
        }}
        size={30}
        color="#fff"
        onClick={toggleMobileMenu}
      />
      <nav
        className={navContainer}
        style={{
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <ul className={listContainer}>
          {sections.map((section) => (
            <MobileMenuSection section={section} key={section.id} />
          ))}
        </ul>
      </nav>
    </>
  );
};
