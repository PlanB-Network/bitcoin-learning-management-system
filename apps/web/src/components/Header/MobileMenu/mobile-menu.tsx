import { Button, cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TbMenu, TbX } from 'react-icons/tb';
import { SideBar } from '#src/components/main-layout.tsx';
import { AppContext } from '#src/providers/context.js';
import PlanBLogoBlack from '../../../assets/logo/planb_logo_horizontal_black.svg?react';
import { LanguageSelectorMobile } from '../language-selector.tsx';
import { UserRoleAvatar } from '../meta-elements.tsx';
import { NotificationsPanel } from '../notifications-panel.tsx';

export interface MobileMenuProps {
  onClickLogin: () => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

export const MobileMenu = ({
  onClickLogin,
  isMobileMenuOpen,
  toggleMobileMenu,
}: MobileMenuProps) => {
  const { t } = useTranslation();
  const { session } = useContext(AppContext);
  const isLoggedIn = !!session;

  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!mobileMenuRef.current || !isMobileMenuOpen) return;

      if (
        mobileMenuRef.current.contains(target) ||
        target?.closest('[data-popover-content]')
      ) {
        return;
      }

      toggleMobileMenu();
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
      <div className="flex w-full items-center justify-between lg:hidden">
        <Link to="/" className="w-fit">
          <PlanBLogoBlack className="h-5 w-auto" />
        </Link>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <NotificationsPanel />
              <div className="h-4.5 w-px bg-neutral-200" />
              <UserRoleAvatar isShort />
            </div>
          ) : (
            <Button variant="primary" size="s" rounded onClick={onClickLogin}>
              {t('auth.signIn')}
            </Button>
          )}
          <TbMenu
            onClick={toggleMobileMenu}
            className="cursor-pointer text-neutral-500 stroke-2 size-8 shrink-0"
          />
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed top-0 left-0 w-full h-dvh bg-neutral-400/80 z-10 lg:hidden" />
      )}

      <nav
        className={cn(
          'flex flex-col fixed top-0 right-0 items-center w-full max-w-[327px] h-dvh duration-300 overflow-scroll no-scrollbar lg:hidden bg-header p-5 pt-3 z-20',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        ref={mobileMenuRef}
      >
        <div className="ml-auto mb-6 flex items-center gap-2">
          {isLoggedIn && <UserRoleAvatar />}
          <TbX
            onClick={toggleMobileMenu}
            className="cursor-pointer text-neutral-500 stroke-2 size-8 shrink-0"
          />
        </div>
        <SideBar isSidebarOpen={true} />
        <LanguageSelectorMobile isMobileMenuOpen={isMobileMenuOpen} />
      </nav>
    </>
  );
};
