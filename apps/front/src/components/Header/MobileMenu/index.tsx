import { FaBars } from 'react-icons/fa';

import { useDisclosure } from '../../../hooks';
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
          'flex fixed top-0 left-0 flex-col items-center px-2 pt-28 pb-5 w-screen h-screen bg-white duration-300',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <ul className="my-0 flex-1 list-none overflow-auto pl-0">
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
