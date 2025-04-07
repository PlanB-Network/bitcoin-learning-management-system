import type { ParsedLocation } from '@tanstack/react-router';
import { Link, useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import { useContext, useEffect, useState } from 'react';
import { AiOutlineBook } from 'react-icons/ai';
import { BsMortarboard } from 'react-icons/bs';
import { FaRegCalendarCheck } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import {
  IoLogOutOutline,
  IoPersonOutline,
  IoTicketOutline,
} from 'react-icons/io5';
import { LuPencilRuler, LuShieldAlert } from 'react-icons/lu';

import { Button } from '@blms/ui';

import pill from '#src/assets/icons/orange_pill_color_gradient.svg';
import SignInIconLight from '#src/assets/icons/profile_log_in_light.svg';
import { AppContext } from '#src/providers/context.js';
import { getPictureUrl } from '#src/services/user.js';
import { BTC402ID, addSpaceToCourseIndex } from '#src/utils/courses.ts';
import { logout } from '#src/utils/session-utils.js';
import { trpc } from '#src/utils/trpc.ts';

import { UserPermission, UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared/auth';
import { FaRegBell } from 'react-icons/fa6';
import { TbBriefcase2 } from 'react-icons/tb';
import { Image } from '#src/components/image.tsx';
import { MenuItem } from './menu-item.tsx';

export const MenuDashboard = ({
  location,
  toggleMobileMenu,
}: {
  location: ParsedLocation;
  toggleMobileMenu?: () => void;
}) => {
  const { user, courses: allCourses } = useContext(AppContext);
  const [pathname, setPathname] = useState('');

  const { data: courses } = trpc.user.courses.getProgress.useQuery(undefined, {
    staleTime: 300_000, // 5 minutes
  });

  // TODO: filter only in progress courses
  const inProgressCourses = courses
    ?.filter((course) => course.progressPercentage < 100)
    .map((course) => {
      return {
        text: `${addSpaceToCourseIndex(course.courseIndex.toLocaleUpperCase())} - ${
          allCourses?.find((c) => c.id === course.courseId)?.name
        }`,
        to: `/dashboard/course/${course.courseId}`,
        onClick: toggleMobileMenu,
      };
    });

  const completedCourses = courses?.filter(
    (course) => course.progressPercentage >= 100,
  );

  const pictureUrl = getPictureUrl(user ? user : null);

  const navigate = useNavigate();

  const credentialsPath = '/dashboard/credentials';
  const bookingsPath = '/dashboard/bookings';
  const calendarPath = '/dashboard/calendar';
  const careerPortalPath = '/dashboard/career-portal';
  const notificationsPath = '/dashboard/notifications';
  const profilePath = '/dashboard/profile';
  const adminBookingsPath = '/dashboard/administration/bookings';
  const adminCouponsPath = '/dashboard/administration/coupons';
  const adminCareersPath = '/dashboard/administration/careers';
  const adminRolePath = '/dashboard/administration/role';
  const adminTutorialsPath = '/dashboard/administration/tutorials';
  const professorProfilePath = '/dashboard/professor/profile';
  const professorCoursesPath = '/dashboard/professor/courses';
  const professorTutorialsPath = '/dashboard/professor/tutorials';

  useEffect(() => {
    if (location) {
      const { pathname } = location;
      if (pathname) {
        setPathname(pathname);
      }
    }
  }, [location]);

  const Separator = () => (
    <div className="w-full h-px bg-darkOrange-8 lg:my-4 rounded-[1px]" />
  );

  return (
    <div className="relative bg-[#1c0a00] flex w-full lg:w-64 min-[1750px]:w-80 flex-col lg:rounded-2xl overflow-hidden shrink-0 min-h-full">
      <img
        src={pill}
        alt="Orange pill"
        className="absolute -top-3 right-2.5 rotate-[-33.85deg] max-lg:hidden"
        height={112}
        width={48}
      />
      <div className="bg-gradient-to-b from-darkOrange-5 to-[#99370000] flex items-center gap-3 py-2 lg:py-8 px-[17px] lg:px-5">
        <Image
          breakpoints={{ default: 35, lg: 60 }}
          src={pictureUrl ?? SignInIconLight}
          alt="avatar"
          className="rounded-full size-[35px] lg:size-[60px]"
        />
        <p className="max-lg:label-medium-16px lg:font-medium lg:leading-relaxed z-10 w-full lg:max-w-[92px] min-[1750px]:max-w-[148px] break-words line-clamp-2">
          {user?.displayName}
        </p>
        {toggleMobileMenu && (
          <IoMdClose
            size={18}
            className="text-tertiary-2 shrink-0 ml-auto cursor-pointer"
            onClick={toggleMobileMenu}
          />
        )}
      </div>
      <div className="flex flex-col pl-5 pr-2.5 max-lg:pt-[15px] lg:px-4 text-darkOrange-5 gap-2.5 lg:gap-1">
        <MenuItem
          text={t('dashboard.courses')}
          icon={<AiOutlineBook size={24} />}
          dropdown={[
            {
              text: t('words.dashboard'),
              to: '/dashboard/courses',
              onClick: toggleMobileMenu,
            },
            ...(inProgressCourses ?? []),
            ...(completedCourses && completedCourses.length > 0
              ? [
                  {
                    text: t('dashboard.myCourses.completed'),
                    to: '/dashboard/course/completed',
                    onClick: toggleMobileMenu,
                  },
                ]
              : []),
          ]}
          storageKey="isDashboardCoursesMenuOpen"
        />
        <Link to={calendarPath}>
          <MenuItem
            text={t('dashboard.calendar.calendar')}
            icon={<FaRegCalendarCheck size={24} />}
            active={pathname.includes(calendarPath)}
            onClick={toggleMobileMenu}
          />
        </Link>
        <Link to={bookingsPath}>
          <MenuItem
            text={t('words.bookings')}
            icon={<IoTicketOutline size={24} />}
            active={pathname.includes(bookingsPath)}
            onClick={toggleMobileMenu}
          />
        </Link>
        <Link to={credentialsPath}>
          <MenuItem
            text={t('words.credentials')}
            icon={<BsMortarboard size={24} />}
            active={pathname.includes(credentialsPath)}
            onClick={toggleMobileMenu}
          />
        </Link>
        {user?.boughtCourses.includes(BTC402ID) ? (
          <Link to={careerPortalPath}>
            <MenuItem
              text={t('dashboard.adminPanel.careers.careers')}
              icon={<TbBriefcase2 size={24} />}
              active={pathname.includes(careerPortalPath)}
              onClick={toggleMobileMenu}
            />
          </Link>
        ) : null}
        <Link to={notificationsPath}>
          <MenuItem
            text={t('notifications.notifications')}
            icon={<FaRegBell size={24} />}
            active={pathname.includes(notificationsPath)}
            onClick={toggleMobileMenu}
          />
        </Link>
        <Link to={profilePath}>
          <MenuItem
            text={t('dashboard.account')}
            icon={<IoPersonOutline size={24} />}
            active={pathname.includes(profilePath)}
            onClick={toggleMobileMenu}
          />
        </Link>

        {user?.professorId && canAccess(UserRole.Professor)(user) && (
          <>
            <Separator />
            <p className="uppercase text-white italic pl-12 text-sm leading-snug py-[5px] truncate">
              {t('dashboard.teacher.menu')}
            </p>
            <Link to={professorProfilePath}>
              <MenuItem
                text={t('dashboard.profile.profile')}
                icon={<IoPersonOutline size={24} />}
                active={pathname.includes(professorProfilePath)}
                onClick={toggleMobileMenu}
              />
            </Link>
            {user.professorCourses?.length > 0 && (
              <Link to={professorCoursesPath}>
                <MenuItem
                  text={t('dashboard.courses')}
                  icon={<AiOutlineBook size={24} />}
                  active={pathname.includes(professorCoursesPath)}
                  onClick={toggleMobileMenu}
                />
              </Link>
            )}
            {user.professorTutorials?.length > 0 && (
              <Link to={professorTutorialsPath}>
                <MenuItem
                  text={t('words.tutorials')}
                  icon={<LuPencilRuler size={24} />}
                  active={pathname.includes(professorTutorialsPath)}
                  onClick={toggleMobileMenu}
                />
              </Link>
            )}
          </>
        )}

        {canAccess(UserRole.Admin)(user) && (
          <>
            <Separator />

            <p className="uppercase text-white italic pl-12 text-sm leading-snug py-[5px] truncate">
              Admin menu
            </p>
            {canAccess(UserRole.Superadmin)(user) && (
              <Link to={adminRolePath}>
                <MenuItem
                  text={t('dashboard.adminPanel.userRolesAllocation')}
                  icon={<LuShieldAlert size={24} />}
                  active={pathname.includes(adminRolePath)}
                  onClick={toggleMobileMenu}
                />
              </Link>
            )}
            {canAccess(UserRole.Admin, UserPermission.Tutorials)(user) && (
              <Link to={adminTutorialsPath}>
                <MenuItem
                  text={t('words.tutorials')}
                  icon={<LuPencilRuler size={24} />}
                  active={pathname.includes(adminTutorialsPath)}
                  onClick={toggleMobileMenu}
                />
              </Link>
            )}
            {canAccess(UserRole.Admin, UserPermission.Bookings)(user) && (
              <Link to={adminBookingsPath}>
                <MenuItem
                  text={t('dashboard.adminPanel.bookings')}
                  icon={<IoTicketOutline size={24} />}
                  active={pathname.includes(adminBookingsPath)}
                  onClick={toggleMobileMenu}
                />
              </Link>
            )}
            {canAccess(UserRole.Admin, UserPermission.Coupons)(user) && (
              <Link to={adminCouponsPath}>
                <MenuItem
                  text={t('dashboard.adminPanel.discountCodes')}
                  icon={<IoTicketOutline size={24} />}
                  active={pathname.includes(adminCouponsPath)}
                  onClick={toggleMobileMenu}
                />
              </Link>
            )}
            {canAccess(UserRole.Admin, UserPermission.Career)(user) && (
              <Link to={adminCareersPath}>
                <MenuItem
                  text={t('dashboard.adminPanel.careers.careers')}
                  icon={<TbBriefcase2 size={24} />}
                  active={pathname.includes(adminCareersPath)}
                  onClick={toggleMobileMenu}
                />
              </Link>
            )}
          </>
        )}

        <Separator />

        <Button
          variant="transparent"
          size="m"
          onClick={async () => {
            await logout();
            await navigate({ to: '/' });
            window.location.reload();
          }}
          className="flex gap-2.5 w-fit my-[15px]"
        >
          <IoLogOutOutline size={24} />
          <span>{t('dashboard.logout')}</span>
        </Button>
      </div>
    </div>
  );
};
