import { cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Logo from '#src/assets/logo.svg?no-inline';

const activeLinkProps = { className: 'text-orange-500' };
const linkClassName = 'hover:font-bold';

export default function DesktopMenu() {
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
        'py-8 px-10  bg-black max-lg:hidden',
        'transition-transform duration-300 transform ',
        isMenuVisible ? 'translate-y-0' : '',
        !isMenuVisible && !isMenuVisible && '-translate-y-full',
      )}
    >
      <div className="max-w-[1440px] flex flex-row justify-between gap-2 mx-auto">
        <Link to="/">
          <img className="h-8 w-auto" src={Logo} alt="" loading="lazy" />
        </Link>
        <div className="flex flex-row gap-16">
          <Link
            to="/academy"
            className={linkClassName}
            activeProps={activeLinkProps}
          >
            {t('menu.academy')}
          </Link>
          <Link
            to="/hubs"
            className={linkClassName}
            activeProps={activeLinkProps}
          >
            {t('menu.hubs')}
          </Link>
          <Link
            to="/funds"
            className={linkClassName}
            activeProps={activeLinkProps}
          >
            {t('menu.funds')}
          </Link>
        </div>
        <div className="flex flex-row gap-16">
          <Link
            to="/news"
            className={linkClassName}
            activeProps={activeLinkProps}
          >
            {t('menu.news')}
          </Link>
          <Link
            to="/about"
            className={linkClassName}
            activeProps={activeLinkProps}
          >
            {t('menu.about')}
          </Link>
        </div>
      </div>
    </div>
  );
}
