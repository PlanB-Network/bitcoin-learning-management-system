import { Link } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaBars } from 'react-icons/fa';

import SignInIcon from '../../../assets/icons/profile_log_in.png';
import PlanBLogoOrange from '../../../assets/planb_logo_horizontal_white_orangepill_whitetext.svg?react';
import PlanBLogoWhite from '../../../assets/planb_logo_horizontal_white_whitepill.svg?react';
import { useDisclosure } from '../../../hooks/index.ts';
import { compose, trpc } from '../../../utils/index.ts';
import { MetaElements } from '../MetaElements/index.tsx';
import type { NavigationSection } from '../props.tsx';

import { MobileMenuSection } from './MobileMenuSection/index.tsx';

export interface MobileMenuProps {
  sections: NavigationSection[];
  onClickLogin: () => void;
  onClickRegister: () => void;
  variant?: 'light' | 'dark';
}

export const MobileMenu = ({
  sections,
  onClickLogin,
  onClickRegister,
  variant = 'dark',
}: MobileMenuProps) => {
  const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu } =
    useDisclosure();
  const { t } = useTranslation();
  const { data: session, isFetched } = trpc.user.getSession.useQuery();
  const isLoggedIn = session?.user?.uid !== undefined;

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  });

  return (
    <>
      <div className="flex w-full justify-center items-center sm:px-3">
        <div className="z-40 min-w-10 mr-auto">
          <FaBars
            className={compose(
              'cursor-pointer text-white',
              isMobileMenuOpen ? 'rotate-90' : 'rotate-0',
            )}
            style={{
              transition: 'transform 0.4s, color 0.2s',
            }}
            size={28}
            color="#fff"
            onClick={toggleMobileMenu}
          />
        </div>

        <Link to="/" className="mx-auto">
          {variant === 'light' ? (
            <PlanBLogoWhite className="h-[34px] w-auto" />
          ) : (
            <PlanBLogoOrange className="h-[34px] w-auto" />
          )}
        </Link>

        {isFetched && isLoggedIn ? (
          <div className="text-sm font-semibold ml-auto min-w-10">
            <Link to={'/dashboard'}>
              <button className="cursor-pointer text-white">
                <img
                  src={SignInIcon}
                  alt={t('auth.signIn')}
                  className="size-10"
                />
              </button>
            </Link>
          </div>
        ) : (
          <div className="text-sm font-semibold ml-auto min-w-10">
            <button
              className="cursor-pointer text-white"
              onClick={onClickLogin}
            >
              <img
                src={SignInIcon}
                alt={t('auth.signIn')}
                className="size-10"
              />
            </button>
          </div>
        )}
      </div>

      <nav
        className={compose(
          'flex fixed top-0 left-0 flex-col items-center px-2 pt-28 pb-5 w-screen h-full bg-black duration-300',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
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
