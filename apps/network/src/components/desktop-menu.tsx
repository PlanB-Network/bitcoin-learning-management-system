import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import Logo from '#src/assets/logo.png?no-inline';

export default function DesktopMenu() {
  return (
    <div className="max-lg:hidden mx-4 py-10 sticky top-0 z-50 bg-black flex flex-row justify-between gap-2 display-extra-small">
      <Link to="/">
        <img className="" src={Logo} alt="" loading="lazy" />
      </Link>
      <div className="flex flex-row gap-16">
        <Link to="/academy">{t('menu.academy')}</Link>
        <Link to="/hubs">{t('menu.hubs')}</Link>
        <Link to="/funds">{t('menu.funds')}</Link>
      </div>
      <div className="flex flex-row gap-16 text-gray-200">
        <Link to="/about">{t('menu.about')}</Link>
        <Link to="/news">{t('menu.news')}</Link>
      </div>
    </div>
  );
}
