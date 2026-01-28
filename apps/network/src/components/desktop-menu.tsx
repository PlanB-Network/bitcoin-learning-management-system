import { cn, Image } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Logo from '#src/assets/logo.svg?no-inline';
import { NetworkButton } from './network-button.tsx';

const activeLinkProps = {
  className: 'text-orange-500 [text-shadow:_0_0_0.5px_currentColor]',
};
const leftLinkClassName =
  'hover:text-orange-500 hover:[text-shadow:0_0_0.5px_currentColor]';
const rightLinkClassName =
  'hover:text-orange-500 hover:[text-shadow:0_0_0.5px_currentColor] font-light';

export default function DesktopMenu({
  variant,
}: {
  variant?: 'light' | 'dark';
}) {
  const { t } = useTranslation();

  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const lastScrollY = useRef(0);

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
        'sticky top-0 z-50 ',
        ' display-extra-small',
        'py-8 px-10 max-lg:hidden',
        'transition-transform duration-300 transform ',
        isMenuVisible ? 'translate-y-0' : '',
        !isMenuVisible && !isMenuVisible && '-translate-y-full',
        variant === 'dark' ? 'bg-[#000000b3]' : 'bg-black text-white',
      )}
    >
      <div className="flex flex-row justify-between items-center gap-2 mx-auto">
        <Link to="/" viewTransition>
          <Image
            className="h-8 w-auto"
            src={Logo}
            alt=""
            loading="lazy"
            breakpoints={{ default: 700 }}
          />
        </Link>
        <div className="flex flex-row gap-8 items-center">
          <Link
            to="/academy"
            className={leftLinkClassName}
            activeProps={activeLinkProps}
            viewTransition
          >
            {t('menu.academy')}
          </Link>
          <Link
            to="/hubs"
            className={leftLinkClassName}
            activeProps={activeLinkProps}
            viewTransition
          >
            {t('menu.hubs')}
          </Link>
          <Link
            to="/funds"
            className={leftLinkClassName}
            activeProps={activeLinkProps}
            viewTransition
          >
            {t('menu.funds')}
          </Link>
          <div className="h-6 w-px bg-white/30" />
          <Link
            to="/news"
            className={rightLinkClassName}
            activeProps={activeLinkProps}
            viewTransition
          >
            {t('menu.news')}
          </Link>
          <Link
            to="/about"
            className={rightLinkClassName}
            activeProps={activeLinkProps}
            viewTransition
          >
            {t('menu.about')}
          </Link>
        </div>
        <Link
          to="https://planb.academy"
          target="_blank"
          rel="noopener noreferrer"
        >
          <NetworkButton variant={'secondary'} size={'learning'}>
            {t('academy.startLearning')}
          </NetworkButton>
        </Link>
      </div>
    </div>
  );
}
