import { Link, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaBars, FaRegCalendarCheck } from 'react-icons/fa';
import { IoPersonOutline, IoTicketOutline } from 'react-icons/io5';
import { LuLogOut } from 'react-icons/lu';
import { MdKeyboardArrowUp } from 'react-icons/md';

import { cn } from '@sovereign-university/ui';

import { UserContext } from '#src/providers/user.js';
import { getPictureUrl } from '#src/services/user.js';
import { logout } from '#src/utils/session-utils.js';

import SignInIconDark from '../../../assets/icons/profile_log_in_dark.svg';
import SignInIconDarkOrange from '../../../assets/icons/profile_log_in_darkOrange.svg';
import SignInIconLight from '../../../assets/icons/profile_log_in_light.svg';
import PlanBLogoOrange from '../../../assets/planb_logo_horizontal_white_orangepill_whitetext.svg?react';
import PlanBLogoWhite from '../../../assets/planb_logo_horizontal_white_whitepill.svg?react';
import { useDisclosure } from '../../../hooks/index.ts';
import { trpc } from '../../../utils/index.ts';
import { LanguageSelector } from '../LanguageSelector/index.tsx';
import type { NavigationSection } from '../props.tsx';

import { MobileMenuSection } from './MobileMenuSection/index.tsx';

export interface MobileMenuProps {
  sections: NavigationSection[];
  onClickLogin: () => void;
  variant?: 'light' | 'dark';
}

interface LoggedMenuProps {
  onClickLogin: () => void;
}

const LoggedMenu = ({ onClickLogin }: LoggedMenuProps) => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const isLoggedIn = user?.uid !== undefined;
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  const navigate = useNavigate();

  const toggleSubMenu = () => {
    setIsSubMenuOpen((prev) => !prev);
  };

  const menuItems = [
    {
      buttonText: t('dashboard.bookings'),
      link: '/dashboard/bookings',
      icon: <IoTicketOutline size={24} />,
    },
    {
      buttonText: t('words.courses'),
      link: '/dashboard',
      icon: <FaRegCalendarCheck size={24} />,
    },
    {
      buttonText: t('words.account'),
      link: '/dashboard/profile',
      icon: <IoPersonOutline size={24} />,
    },
  ];

  return (
    <div className="w-full px-4 mt-7">
      {isLoggedIn && (
        <>
          <button
            onClick={toggleSubMenu}
            className="w-full flex items-center gap-3.5 bg-darkOrange-10 px-1.5 py-1 rounded-lg"
          >
            <img
              src={SignInIconDarkOrange}
              alt={t('auth.signIn')}
              className="size-10 shrink-0"
            />
            <span className="font-medium">{user?.username}</span>
            <MdKeyboardArrowUp
              size={24}
              className={cn(
                'ml-auto transition-transform ease-in-out',
                isSubMenuOpen && 'max-lg:rotate-180',
              )}
            />
          </button>
          {isSubMenuOpen && (
            <div className="flex flex-col gap-2.5 pl-[60px] mt-2.5">
              {menuItems.map((item) => (
                <Link
                  to={item.link}
                  key={item.buttonText}
                  className="flex items-center gap-4 desktop-body1 py-1.5"
                >
                  {item.icon}
                  {item.buttonText}
                </Link>
              ))}
              <button
                onClick={async () => {
                  await logout();
                  await navigate({ to: '/' });
                  window.location.reload();
                }}
                className="flex items-center gap-4 desktop-body1 py-1.5"
              >
                <LuLogOut size={24} />
                {t('dashboard.logout')}
              </button>
            </div>
          )}
        </>
      )}

      {!isLoggedIn && (
        <button
          className="cursor-pointer text-white flex items-center gap-2.5 w-full px-1 py-0.5"
          onClick={onClickLogin}
        >
          <img
            src={SignInIconDarkOrange}
            alt={t('auth.signIn')}
            className="size-10"
          />
          <span className="italic">{t('menu.loginRegister')}</span>
        </button>
      )}
    </div>
  );
};

export const MobileMenu = ({
  sections,
  onClickLogin,
  variant = 'dark',
}: MobileMenuProps) => {
  const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu } =
    useDisclosure();
  const { t } = useTranslation();
  const { data: session, isFetched } = trpc.user.getSession.useQuery();
  const isLoggedIn = session?.user?.uid !== undefined;

  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const { user } = useContext(UserContext);
  const pictureUrl = useMemo(() => getPictureUrl(user), [user]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';

    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        toggleMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen, toggleMobileMenu]);

  return (
    <>
      <div className="flex w-full justify-center items-center sm:px-3">
        <div
          className={cn('min-w-10 mr-auto', isMobileMenuOpen && 'opacity-0')}
        >
          <FaBars
            className={cn(
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
                  src={
                    pictureUrl
                      ? pictureUrl
                      : variant === 'light'
                        ? SignInIconLight
                        : SignInIconDark
                  }
                  alt={t('auth.signIn')}
                  className="size-10 rounded-full"
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
                src={variant === 'light' ? SignInIconLight : SignInIconDark}
                alt={t('auth.signIn')}
                className="size-10"
              />
            </button>
          </div>
        )}
      </div>

      <nav
        className={cn(
          'flex flex-col fixed top-0 left-0 items-center w-full max-w-[270px] h-svh pb-5 bg-darkOrange-11 duration-300 rounded-br-sm border-r border-b border-darkOrange-9 overflow-scroll no-scrollbar',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        ref={mobileMenuRef}
      >
        <div className="flex items-center w-full px-4 py-5 bg-gradient-to-b from-[rgba(255,_92,_0,_0.70)] to-[rgba(153,_55,_0,_0.00)">
          <FaBars
            className={cn(
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
          <Link
            to="/"
            className="ml-4 text-lg font-medium leading-normal text-white"
          >
            {t('words.home')}
          </Link>
          <LanguageSelector className="ml-auto" variant="darkOrange" />
        </div>
        <ul className="list-none w-full px-4 flex flex-col gap-5">
          {sections.map((section) => (
            <MobileMenuSection section={section} key={section.id} />
          ))}
        </ul>
        <LoggedMenu onClickLogin={onClickLogin} />
      </nav>
    </>
  );
};
