import { Link } from '@tanstack/react-router';
import Logo from '#src/assets/logo.png?no-inline';

export default function DesktopMenu() {
  return (
    <div className="max-lg:hidden mx-4 py-10 sticky top-0 z-50 bg-black flex flex-row justify-between gap-2 display-extra-small">
      <Link to="/">
        <img className="" src={Logo} alt="" loading="lazy" />
      </Link>
      <div className="flex flew-row gap-16">
        <Link to="/academy">Academy</Link>
        <Link to="/hubs">Hubs</Link>
        <Link to="/funds">Funds</Link>
      </div>
      <div className="flex flew-row gap-16 text-gray-200">
        <Link to="/about">About</Link>
        <Link to="/news">News</Link>
        <span>EN</span>
      </div>
    </div>
  );
}
