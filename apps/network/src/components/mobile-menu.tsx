import { cn, Image } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TbMenu2, TbX } from 'react-icons/tb';
import Logo from '#src/assets/logo.svg?no-inline';
import { NetworkButton } from './network-button.tsx';

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

  return (
    <div className={cn('sticky top-0 z-50 text-black bg-black lg:hidden')}>
      <div className="flex w-full items-center justify-between px-2">
        <Link to="/" className="w-fit">
          <Image
            className="my-4 h-8 w-auto"
            src={Logo}
            alt=""
            loading="lazy"
            breakpoints={{ default: 700 }}
          />
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
          'flex flex-col justify-between w-full h-dvh',
          'fixed top-0 right-0 items-center text-center',
          ' p-5 pt-3',
          'bg-black text-white',
          ' duration-300 overflow-scroll no-scrollbar ',
          'z-20 lg:hidden',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        ref={mobileMenuRef}
      >
        <div className="flex flex-col w-full items-center gap-15">
          <div className="w-full flex flex-row justify-between">
            <Link to="/" onClick={toggleMobileMenu}>
              <Image
                src={Logo}
                alt="Logo Plan ₿ Network"
                className="w-40 self-start"
                loading="lazy"
                breakpoints={{ default: 700 }}
              />
            </Link>
            <TbX
              onClick={toggleMobileMenu}
              className="cursor-pointer text-neutral-500 stroke-2 size-8 shrink-0 self-end"
            />
          </div>
          <div className="flex flex-col gap-6 display-small text-center items-center w-fit">
            <Link to="/academy" onClick={toggleMobileMenu}>
              {t('menu.academy')}
            </Link>
            <Link to="/hubs" onClick={toggleMobileMenu}>
              {t('menu.hubs')}
            </Link>
            <Link to="/funds" onClick={toggleMobileMenu}>
              {t('menu.funds')}
            </Link>
            <Link to="/news" onClick={toggleMobileMenu} className="mt-15">
              {t('menu.news')}
            </Link>
            <Link to="/about" onClick={toggleMobileMenu}>
              {t('menu.about')}
            </Link>
          </div>
        </div>
        <Link
          to="https://planb.academy"
          target="_blank"
          rel="noopener noreferrer"
        >
          <NetworkButton className="self-center mb-6" variant={'tertiary'}>
            {t('academy.startLearning')}
          </NetworkButton>
        </Link>
      </nav>
    </div>
  );
};
