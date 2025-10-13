import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import Logo from '#src/assets/logo.png?no-inline';

export default function DesktopMenu() {
  const linkClassName = 'hover:font-bold';

  return (
    <div className="max-lg:hidden mx-4 py-10 sticky top-0 z-50 bg-black flex flex-row justify-between gap-2 display-extra-small">
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
