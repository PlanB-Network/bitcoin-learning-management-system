import { cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbMenu2, TbX } from 'react-icons/tb';
import Logo from '#src/assets/logo.svg?no-inline';

export interface MobileMenuProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

export const MobileMenu = ({
  isMobileMenuOpen,
  toggleMobileMenu,
}: MobileMenuProps) => {
  const { t } = useTranslation();

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (isMobileMenuOpen) {
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
    } else {
      html.style.overflow = '';
      body.style.overflow = '';
    }

    return () => {
      html.style.overflow = '';
      body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
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

  useEffect(() => {
    const updateMenuVisibility = () => {
      if (window.scrollY > lastScrollY.current && window.scrollY > 50) {
        setIsMenuVisible(false);
      } else {
        setIsMenuVisible(true);
      }

      lastScrollY.current = window.scrollY;
    };

    window.addEventListener('scroll', updateMenuVisibility);

    return () => {
      window.removeEventListener('scroll', updateMenuVisibility);
    };
  }, []);

  return (
    <div
      className={cn(
        'sticky top-0 z-50',
        'text-black bg-black lg:hidden',
        'transition-transform duration-300 transform',
        isMobileMenuOpen ? 'translate-y-0' : '',
        !isMobileMenuOpen && !isMenuVisible && '-translate-y-full',
      )}
    >
      <div className="flex w-full items-center justify-between px-2">
        <Link to="/" className="w-fit">
          <img className="my-4 h-8 w-auto" src={Logo} alt="" loading="lazy" />
        </Link>

        <div className="flex items-center gap-2">
          <TbMenu2
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
          isMenuVisible
            ? isMobileMenuOpen
              ? 'translate-x-0'
              : 'translate-x-full'
            : 'hidden',
        )}
        ref={mobileMenuRef}
      >
        <div className="ml-auto mb-6 flex flex-col items-center gap2">
          <TbX
            onClick={toggleMobileMenu}
            className="cursor-pointer text-neutral-500 stroke-2 size-8 shrink-0"
          />
          <div className="flex flex-col gap-2 display-extra-small">
            <div className="flex flex-col gap-2">
              <Link to="/academy" onClick={toggleMobileMenu}>
                {t('menu.academy')}
              </Link>
              <Link to="/hubs" onClick={toggleMobileMenu}>
                {t('menu.hubs')}
              </Link>
              <Link to="/funds" onClick={toggleMobileMenu}>
                {t('menu.funds')}
              </Link>
            </div>
            <div className="flex flex-col gap-2 text-gray-700">
              <Link to="/about" onClick={toggleMobileMenu}>
                {t('menu.about')}
              </Link>
              <Link to="/news" onClick={toggleMobileMenu}>
                {t('menu.news')}
              </Link>
            </div>
          </div>
        </div>
        {/* <SideBar isSidebarOpen={true} /> */}
      </nav>
    </div>
  );
};
