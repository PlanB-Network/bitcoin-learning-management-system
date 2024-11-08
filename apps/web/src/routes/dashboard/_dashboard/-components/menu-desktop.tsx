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
import { LuShieldAlert } from 'react-icons/lu';

import pill from '#src/assets/icons/orange_pill_color_gradient.svg';
import SignInIconLight from '#src/assets/icons/profile_log_in_light.svg';
import { AppContext } from '#src/providers/context.js';
import { getPictureUrl } from '#src/services/user.js';
import { addSpaceToCourseId } from '#src/utils/courses.ts';
import { logout } from '#src/utils/session-utils.js';
import { trpc } from '#src/utils/trpc.ts';

import { MenuItem } from './menu-item.tsx';

export const MenuDesktop = ({
  location,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  location: ParsedLocation<any>;
}) => {
  const { user } = useContext(AppContext);
  const [pathname, setPathname] = useState('');

  const { data: courses } = trpc.user.courses.getProgress.useQuery(undefined, {
    staleTime: 300_000, // 5 minutes
  });

  // TODO: filter only in progress courses
  const inProgressCourses = courses
    ?.filter((course) => course.progressPercentage < 100)
    .map((course) => {
      return {
        text: addSpaceToCourseId(course.courseId.toLocaleUpperCase()),
        to: `/dashboard/course/${course.courseId}`,
      };
    });

  const completedCourses = courses?.filter(
    (course) => course.progressPercentage >= 100,
  );

  const pictureUrl = getPictureUrl(user);

  const navigate = useNavigate();

  const dashboardPath = '/dashboard/courses';
  const credentialsPath = '/dashboard/credentials';
  const bookingsPath = '/dashboard/bookings';
  const calendarPath = '/dashboard/calendar';
  const coursesPath = '/dashboard/courses';
  const profilePath = '/dashboard/profile';
  const administrationPath = '/dashboard/administration';
  const professorProfilePath = '/dashboard/professor/profile';
  const professorCoursesPath = '/dashboard/professor/courses';

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
        <MenuItem
          text={t('dashboard.courses')}
          icon={<AiOutlineBook size={24} />}
          active={
            pathname.includes(coursesPath) || pathname.endsWith(dashboardPath)
          }
          dropdown={[
            ...(inProgressCourses ?? []),
            ...(completedCourses && completedCourses.length > 0
              ? [{ text: 'Completed', to: '/dashboard/course/completed' }]
              : []),
          ]}
        />
        <Link to={calendarPath}>
          <MenuItem
            text={t('dashboard.calendar.calendar')}
            icon={<FaRegCalendarCheck size={24} />}
            active={pathname.includes(calendarPath)}
          />
        </Link>
        <Link to={bookingsPath}>
          <MenuItem
            text={t('words.bookings')}
            icon={<IoTicketOutline size={24} />}
            active={pathname.includes(bookingsPath)}
          />
        </Link>
        <Link to={credentialsPath}>
          <MenuItem
            text={t('words.credentials')}
            icon={<BsMortarboard size={24} />}
            active={pathname.includes(credentialsPath)}
          />
        </Link>
        <Link to={profilePath}>
          <MenuItem
            text={t('dashboard.account')}
            icon={<IoPersonOutline size={24} />}
            active={pathname.includes(profilePath)}
          />
        </Link>

        {user && (user.role === 'admin' || user.role === 'superadmin') && (
          <>
            <Separator />

            <Link to={administrationPath}>
              <MenuItem
                text={t('dashboard.adminPanel.userRolesAllocation')}
                icon={<LuShieldAlert size={24} />}
                active={pathname.includes(administrationPath)}
              />
            </Link>
          </>
        )}

        {user && user.role === 'professor' && (
          <>
            <Separator />

            <p className="uppercase text-white italic ml-12 text-sm">
              {t('dashboard.teacher.menu')}
            </p>

            <Link to={professorProfilePath}>
              <MenuItem
                text={t('dashboard.profile.profile')}
                icon={<IoPersonOutline size={24} />}
                active={pathname.includes(professorProfilePath)}
              />
            </Link>

            {user.professorCourses?.length && (
              <Link to={professorCoursesPath}>
                <MenuItem
                  text={t('dashboard.courses')}
                  icon={<AiOutlineBook size={24} />}
                  active={pathname.includes(professorCoursesPath)}
                />
              </Link>
            )}
          </>
        )}

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
