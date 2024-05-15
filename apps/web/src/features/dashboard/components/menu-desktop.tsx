import { useLocation } from '@react-hooks-library/core';
import { Link, useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { AiOutlineBook } from 'react-icons/ai';
import { BsPersonFill } from 'react-icons/bs';
import { FaRegCalendarCheck } from 'react-icons/fa';
import { IoLogOutOutline, IoPersonOutline } from 'react-icons/io5';

import { logout } from '#src/utils/session-utils.js';

import pill from '../../../assets/icons/orange_pill_color_gradient.svg';
import { trpc } from '../../../utils/index.ts';

import { MenuItem } from './menu-item.tsx';

export const MenuDesktop = () => {
  const { data: user } = trpc.user.getDetails.useQuery();
  const [pathname, setPathname] = useState('');

  const navigate = useNavigate();

  const location = useLocation();

  const dashboardPath = '/dashboard';
  const bookingsPath = '/dashboard/bookings';
  const profilePath = '/dashboard/profile';

  useEffect(() => {
    if (location) {
      const { pathname } = location;
      if (pathname) {
        setPathname(pathname);
      }
    }
  }, [location]);

  const Separator = () => (
    <div className="w-full h-px bg-darkOrange-8 my-4 rounded-[1px]" />
  );

  return (
    <div className="relative bg-[#1c0a00] flex w-64 min-[1750px]:w-80 flex-col rounded-2xl overflow-hidden">
      <img
        src={pill}
        alt="Orange pill"
        className="absolute -top-3 right-2.5 rotate-[-33.85deg]"
        height={112}
        width={48}
      />
      <div className="bg-gradient-to-b from-darkOrange-5 to-[#99370000] flex items-center gap-3 py-8 px-5">
        <BsPersonFill className="text-darkOrange-5 size-[60px] overflow-hidden rounded-xl bg-white shrink-0" />
        <p className="font-medium leading-relaxed z-10 max-w-[92px] min-[1750px]:max-w-[148px] break-words">
          {user?.username}
        </p>
      </div>
      <div className="flex flex-col px-4 text-darkOrange-5 gap-1">
        <Link to={dashboardPath}>
          <MenuItem
            text={t('dashboard.courses')}
            icon={<AiOutlineBook size={24} />}
            active={pathname.endsWith(dashboardPath)}
          />
        </Link>
        <Link to={bookingsPath}>
          <MenuItem
            text={t('dashboard.bookings')}
            icon={<FaRegCalendarCheck size={24} />}
            active={pathname.includes(bookingsPath)}
          />
        </Link>
        <Link to={profilePath}>
          <MenuItem
            text={t('dashboard.account')}
            icon={<IoPersonOutline size={24} />}
            active={pathname.includes(profilePath)}
          />
        </Link>
        <Separator />
        <MenuItem
          text={t('dashboard.logout')}
          icon={<IoLogOutOutline size={24} />}
          onClick={async () => {
            await logout();
            await navigate({ to: '/' });
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
};
