import type { ParsedLocation } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { AiOutlineBook } from 'react-icons/ai';
import { BsMortarboard } from 'react-icons/bs';
import { FaRegCalendarCheck } from 'react-icons/fa';
import { IoPersonOutline, IoTicketOutline } from 'react-icons/io5';

import { MenuItem } from './menu-item.tsx';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MenuMobile = ({ location }: { location: ParsedLocation<any> }) => {
  const [pathname, setPathname] = useState('');

  const dashboardPath = '/dashboard/courses';
  const credentialsPath = '/dashboard/credentials';
  const bookingsPath = '/dashboard/bookings';
  const calendarPath = '/dashboard/calendar';
  const courseDetailPath = '/dashboard/course';
  const profilePath = '/dashboard/profile';

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
      <Link to={dashboardPath}>
        <MenuItem
          text={t('dashboard.courses')}
          icon={<AiOutlineBook size={18} />}
          active={
            pathname === dashboardPath || pathname.startsWith(courseDetailPath)
          }
        />
      </Link>
      <Link to={calendarPath}>
        <MenuItem
          text={t('dashboard.calendar.calendar')}
          icon={<FaRegCalendarCheck size={18} />}
          active={pathname === calendarPath}
        />
      </Link>
      <Link to={bookingsPath}>
        <MenuItem
          text={t('words.bookings')}
          icon={<IoTicketOutline size={18} />}
          active={pathname === bookingsPath}
        />
      </Link>
      <Link to={credentialsPath}>
        <MenuItem
          text={t('words.credentials')}
          icon={<BsMortarboard size={18} />}
          active={pathname === credentialsPath}
        />
      </Link>
      <Link to={profilePath}>
        <MenuItem
          text={t('dashboard.account')}
          icon={<IoPersonOutline size={18} />}
          active={pathname === profilePath}
        />
      </Link>
    </div>
  );
};
