import { FaBars } from 'react-icons/fa';

import { useDisclosure } from '../../../hooks';
import { compose } from '../../../utils';
import { NavigationSection } from '../props';

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
        className={compose(
          'absolute z-40 cursor-pointer left-[4vw]',
          isMobileMenuOpen ? 'rotate-90' : 'rotate-0',
          isMobileMenuOpen ? 'text-primary-800' : 'text-white'
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
          'flex fixed top-0 left-0 flex-col px-2 pt-28 pb-5 w-screen h-screen bg-white duration-300',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <ul className="overflow-auto flex-1 pl-0 mt-0 mb-0 list-none">
          {sections.map((section) => (
            <MobileMenuSection section={section} key={section.id} />
          ))}
        </ul>
      </nav>
    </>
  );
};
