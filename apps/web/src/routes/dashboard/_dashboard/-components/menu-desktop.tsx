import type { ParsedLocation } from '@tanstack/react-router';
import { Link, useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import { useContext, useEffect, useState } from 'react';
import { AiOutlineBook } from 'react-icons/ai';
import { BsMortarboard } from 'react-icons/bs';
import { FaRegCalendarCheck } from 'react-icons/fa';
import {
  IoLogOutOutline,
  IoPersonOutline,
  IoTicketOutline,
} from 'react-icons/io5';

import pill from '#src/assets/icons/orange_pill_color_gradient.svg';
import SignInIconLight from '#src/assets/icons/profile_log_in_light.svg';
import { AppContext } from '#src/providers/context.js';
import { getPictureUrl } from '#src/services/user.js';
import { logout } from '#src/utils/session-utils.js';

import { MenuItem } from './menu-item.tsx';

export const MenuDesktop = ({
  location,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  location: ParsedLocation<any>;
}) => {
  const { user } = useContext(AppContext);
  const [pathname, setPathname] = useState('');

  const pictureUrl = getPictureUrl(user);

  const navigate = useNavigate();

  const dashboardPath = '/dashboard/courses';
  const bCertificatePath = '/dashboard/bcertificate';
  const bookingsPath = '/dashboard/bookings';
  const calendarPath = '/dashboard/calendar';
  const coursesPath = '/dashboard/courses';
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
    <div className="relative bg-[#1c0a00] flex w-64 min-[1750px]:w-80 flex-col rounded-2xl overflow-hidden shrink-0">
      <img
        src={pill}
        alt="Orange pill"
        className="absolute -top-3 right-2.5 rotate-[-33.85deg]"
        height={112}
        width={48}
      />
      <div className="bg-gradient-to-b from-darkOrange-5 to-[#99370000] flex items-center gap-3 py-8 px-5">
        <img
          src={pictureUrl ?? SignInIconLight}
          alt="avatar"
          className="rounded-full size-[60px]"
        />
        <p className="font-medium leading-relaxed z-10 max-w-[92px] min-[1750px]:max-w-[148px] break-words">
          {user?.displayName}
        </p>
      </div>
      <div className="flex flex-col px-4 text-darkOrange-5 gap-1">
        <Link to={coursesPath}>
          <MenuItem
            text={t('dashboard.courses')}
            icon={<AiOutlineBook size={24} />}
            active={
              pathname.includes(coursesPath) || pathname.endsWith(dashboardPath)
            }
          />
        </Link>
        <Link to={calendarPath}>
          <MenuItem
            text={t('dashboard.calendar.calendar')}
            icon={<FaRegCalendarCheck size={24} />}
            active={pathname.includes(calendarPath)}
          />
        </Link>
        <Link to={bookingsPath}>
          <MenuItem
            text={t('dashboard.bookings')}
            icon={<IoTicketOutline size={24} />}
            active={pathname.includes(bookingsPath)}
          />
        </Link>
        <Link to={bCertificatePath}>
          <MenuItem
            text={t('words.bCertificate')}
            icon={<BsMortarboard size={24} />}
            active={pathname === bCertificatePath}
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
