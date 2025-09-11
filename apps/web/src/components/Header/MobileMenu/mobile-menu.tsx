import { cn } from '@blms/ui';
import { Link, useLocation } from '@tanstack/react-router';
import { useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { HiMiniBars3 } from 'react-icons/hi2';
import { IoMdClose } from 'react-icons/io';

import { AppContext } from '#src/providers/context.js';
import { MenuDashboard } from '#src/routes/$lang/dashboard/_dashboard/-components/menu-dashboard.tsx';
import { getPictureUrl } from '#src/services/user.js';
import SignInIconLight from '../../../assets/icons/profile_log_in_light.svg';
import PlanBLogoBlack from '../../../assets/logo/planb_logo_horizontal_black.svg?react';
import { isRTL } from '../../../utils/i18n.ts';
import { LanguageSelectorMobile } from '../language-selector.tsx';
import { NotificationsPanel } from '../notifications-panel.tsx';
import type { NavigationSectionMobile } from '../props.ts';
import { MobileMenuSection } from './mobile-menu-section.tsx';

export interface MobileMenuProps {
  sections: NavigationSectionMobile[];
  onClickLogin: () => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  isMobileDashboardMenuOpen: boolean;
  toggleDashboardMenu: () => void;
}

export const MobileMenu = ({
  sections,
  onClickLogin,
  isMobileMenuOpen,
  toggleMobileMenu,
  isMobileDashboardMenuOpen,
  toggleDashboardMenu,
}: MobileMenuProps) => {
  const { t, i18n } = useTranslation();
  const rtl = isRTL(i18n.language);
  const { session, user } = useContext(AppContext);
  const isLoggedIn = !!session;

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const dashboardMenuRef = useRef<HTMLDivElement>(null);

  const pictureUrl = getPictureUrl(user);

  const location = useLocation();

  useEffect(() => {
    document.body.style.overflow =
      isMobileMenuOpen || isMobileDashboardMenuOpen ? 'hidden' : 'auto';

    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        isMobileMenuOpen
      )
        toggleMobileMenu();
      if (
        dashboardMenuRef.current &&
        !dashboardMenuRef.current.contains(event.target as Node) &&
        isMobileDashboardMenuOpen
      )
        toggleDashboardMenu();
    };

    if (isMobileMenuOpen || isMobileDashboardMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [
    isMobileMenuOpen,
    isMobileDashboardMenuOpen,
    toggleMobileMenu,
    toggleDashboardMenu,
  ]);

  return (
    <>
      <div className="flex w-full items-center justify-between lg:hidden">
        <div className="flex items-center gap-2.5">
          <div
            className={cn('shrink-0 min-w-8', isMobileMenuOpen && 'opacity-0')}
          >
            <HiMiniBars3
              className={cn(
                'cursor-pointer text-white',
                isMobileMenuOpen ? 'rotate-90' : 'rotate-0',
              )}
              style={{
                transition: 'transform 0.4s, color 0.2s',
              }}
              size={25}
              color="#000"
              onClick={toggleMobileMenu}
            />
          </div>

          <Link to="/" className="w-fit">
            <PlanBLogoBlack className="h-[25px] w-auto" />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <NotificationsPanel />
              <div className="text-sm font-semibold shrink-0 min-w-8">
                <button
                  type="button"
                  onClick={toggleDashboardMenu}
                  className="cursor-pointer text-white"
                >
                  <img
                    src={pictureUrl ? pictureUrl : SignInIconLight}
                    alt={t('auth.signIn')}
                    className="size-8 rounded-full"
                  />
                </button>
              </div>
            </>
          ) : (
            <div className="text-sm font-semibold shrink-0 min-w-8">
              <button
                type="button"
                onClick={onClickLogin}
                className="cursor-pointer text-white"
              >
                <img
                  src={SignInIconLight}
                  alt={t('auth.signIn')}
                  className="size-8"
                />
              </button>
            </div>
          )}
        </div>
      </div>

      <nav
        className={cn(
          'flex flex-col fixed top-0 items-center w-[90%] max-w-[440px] h-dvh pb-5 duration-300 overflow-scroll no-scrollbar lg:hidden bg-darkOrange-2  border-darkOrange-4',
          rtl ? 'right-0 border-l' : 'left-0 border-r',
          isMobileMenuOpen
            ? 'translate-x-0'
            : rtl
              ? 'translate-x-full'
              : '-translate-x-full',
        )}
        ref={mobileMenuRef}
      >
        <div className="flex items-center w-full px-4 py-4 text-newBlack-1 ">
          <HiMiniBars3
            className={cn(
              'cursor-pointer',
              isMobileMenuOpen ? 'rotate-90' : 'rotate-0',
            )}
            style={{
              transition: 'transform 0.4s, color 0.2s',
            }}
            size={25}
            onClick={toggleMobileMenu}
          />
          <Link
            to="/"
            className={cn('text-lg font-medium leading-normal ml-5')}
          >
            {t('words.home')}
          </Link>
          <IoMdClose
            size={24}
            className={cn('text-maroon-7 shrink-0 cursor-pointer ml-auto')}
            onClick={toggleMobileMenu}
          />
        </div>
        <ul className="list-none w-full px-4 flex flex-col gap-2.5 my-4">
          {sections.map((section) => (
            <MobileMenuSection section={section} key={section.id} />
          ))}
        </ul>
        <LanguageSelectorMobile />
      </nav>

      {isLoggedIn && (
        <nav
          className={cn(
            'flex flex-col fixed top-0 right-0 items-center w-[90%] max-w-[440px] h-dvh duration-300 overflow-scroll no-scrollbar lg:hidden border-l border-darkOrange-8',
            isMobileDashboardMenuOpen ? 'translate-x-0' : 'translate-x-full',
          )}
          ref={dashboardMenuRef}
        >
          <MenuDashboard
            location={location}
            toggleMobileMenu={toggleDashboardMenu}
          />
        </nav>
      )}
    </>
  );
};
