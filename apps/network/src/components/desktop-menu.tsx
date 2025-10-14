import { cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Logo from '#src/assets/logo.png?no-inline';

export default function DesktopMenu() {
  const { t } = useTranslation();

  const linkClassName = 'hover:font-bold';
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
        'max-lg:hidden pox-4 py-10 px-4 sticky top-0 z-50 bg-black flex flex-row justify-between gap-2 display-extra-small',
        'transition-transform duration-300 transform ',
        isMenuVisible ? 'translate-y-0' : '',
        !isMenuVisible && !isMenuVisible && '-translate-y-full',
      )}
    >
      <Link to="/">
        <img className="" src={Logo} alt="" loading="lazy" />
      </Link>
      <div className="flex flex-row gap-16">
        <Link to="/academy" className={linkClassName}>
          {t('menu.academy')}
        </Link>
        <Link to="/hubs" className={linkClassName}>
          {t('menu.hubs')}
        </Link>
        <Link to="/funds" className={linkClassName}>
          {t('menu.funds')}
        </Link>
      </div>
      <div className="flex flex-row gap-16 text-gray-200">
        <Link to="/about" className={linkClassName}>
          {t('menu.about')}
        </Link>
        <Link to="/news" className={linkClassName}>
          {t('menu.news')}
        </Link>
      </div>
    </div>
  );
}
