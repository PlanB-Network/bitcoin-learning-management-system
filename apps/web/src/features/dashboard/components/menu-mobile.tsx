import { useLocation } from '@react-hooks-library/core';
import { Link, useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { AiOutlineBook } from 'react-icons/ai';
import { IoPersonOutline, IoTicketOutline } from 'react-icons/io5';
import { LuLogOut } from 'react-icons/lu';

import { logout } from '#src/utils/session-utils.js';

import { MenuItem } from './menu-item.tsx';

export const MenuMobile = () => {
  const [pathname, setPathname] = useState('');

  const navigate = useNavigate();

  const location = useLocation();

  const dashboardPath = '/dashboard';
  const profilePath = '/dashboard/profile';
  const courseDetailPath = '/dashboard/course';
  const bookingsPath = '/dashboard/bookings';

  useEffect(() => {
    if (location) {
      const { pathname } = location;
      if (pathname) {
        setPathname(`/${pathname.split('/').slice(2).join('/')}`);
      }
    }
  }, [location]);

  return (
    <div className="fixed bottom-0 py-2 z-10 mx-auto flex justify-around w-full bg-gradient-to-r from-[#913501] to-[#FD5C01] text-white lg:hidden">
      <Link to={bookingsPath}>
        <MenuItem
          text={t('dashboard.bookings')}
          icon={<IoTicketOutline size={28} />}
          active={pathname === bookingsPath}
        />
      </Link>
      <Link to={dashboardPath}>
        <MenuItem
          text={t('dashboard.courses')}
          icon={<AiOutlineBook size={28} />}
          active={
            pathname === dashboardPath || pathname.startsWith(courseDetailPath)
          }
        />
      </Link>
      <Link to={profilePath}>
        <MenuItem
          text={t('dashboard.account')}
          icon={<IoPersonOutline size={28} />}
          active={pathname === profilePath}
        />
      </Link>
      <MenuItem
        text={t('dashboard.logout')}
        icon={<LuLogOut size={28} />}
        onClick={async () => {
          await logout();
          await navigate({ to: '/' });
          window.location.reload();
        }}
      />
    </div>
  );
};
