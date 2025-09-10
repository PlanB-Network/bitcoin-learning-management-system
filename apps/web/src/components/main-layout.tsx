import { UserRole } from '@blms/constants';
import { COURSES_CAREER_ACCESS, canAccess } from '@blms/shared';
import {
  cn,
  customToast,
  ScrollToTopButton,
  SegmentedControl,
  SegmentedControlItem,
} from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { type JSX, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IconType } from 'react-icons/lib';
import BookCover from '#src/assets/icons/pixelated/navbar/book_cover.svg?react';
import BookOpen from '#src/assets/icons/pixelated/navbar/book_open.svg?react';
import Calendar from '#src/assets/icons/pixelated/navbar/calendar.svg?react';
import Discount from '#src/assets/icons/pixelated/navbar/discount.svg?react';
import Dollar from '#src/assets/icons/pixelated/navbar/dollar.svg?react';
import Luggage from '#src/assets/icons/pixelated/navbar/luggage.svg?react';
import Medal from '#src/assets/icons/pixelated/navbar/medal.svg?react';
import Pages from '#src/assets/icons/pixelated/navbar/pages.svg?react';
import PeopleFrame from '#src/assets/icons/pixelated/navbar/people_frame.svg?react';
import PositionPin from '#src/assets/icons/pixelated/navbar/position_pin.svg?react';
import ProjectPen from '#src/assets/icons/pixelated/navbar/project_pen.svg?react';
import Target from '#src/assets/icons/pixelated/navbar/target.svg?react';
// import Youtube from '#src/assets/icons/pixelated/navbar/streaming.svg?react';
import TasksList from '#src/assets/icons/pixelated/navbar/tasks_list.svg?react';
import Ticket from '#src/assets/icons/pixelated/navbar/ticket.svg?react';
import SignInIconLight from '#src/assets/icons/profile_log_in_light.svg';
import { AppContext } from '#src/providers/context.tsx';
import { Footer } from './footer.tsx';
import { Header } from './Header/header.tsx';

interface MainLayoutProps {
  children: JSX.Element | JSX.Element[];
  showFooter?: boolean;
}

export const MainLayout = ({
  children,
  showFooter = true,
}: MainLayoutProps) => {
  const { t } = useTranslation();

  const { isSidebarOpen, setIsSidebarOpen } = useContext(AppContext);

  const [isResizing, setIsResizing] = useState(false);

  const resizeTimerRef = useRef<number | null>(null);

  // using session storage to check if user just registered and show toast
  useEffect(() => {
    const hasJustRegistered = sessionStorage.getItem('hasJustRegistered');

    if (hasJustRegistered) {
      customToast(t('auth.dashboardUnlocked'), {
        closeButton: true,
        color: 'primary',
        imgSrc: SignInIconLight,
        mode: 'light',
        onClick: () => {
          window.location.href = '/dashboard/my-courses';
        },
        time: 5000,
      });

      sessionStorage.removeItem('hasJustRegistered');
    }
  }, [t]);

  // handle resize to avoid transition lag
  useEffect(() => {
    const onResize = () => {
      setIsResizing(true);

      if (resizeTimerRef.current) {
        window.clearTimeout(resizeTimerRef.current);
      }
      resizeTimerRef.current = window.setTimeout(() => {
        setIsResizing(false);
        resizeTimerRef.current = null;
      }, 120);
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (resizeTimerRef.current) window.clearTimeout(resizeTimerRef.current);
    };
  }, []);

  const closedMargin = 'lg:ml-[86px]';
  const openMargin = 'lg:ml-[276px]';

  return (
    <div className="text-white flex flex-col bg-header w-full max-w-[1440px] mx-auto relative">
      {/* Display titlebar on pear app */}
      {import.meta.env.VITE_PEAR_ENVIRONMENT ? (
        <div className="fixed top-0 left-0 w-full h-[50px] bg-[#ff5c00c3] shadow-lg shadow-gray-700/50 z-50">
          <pear-ctrl data-platform="darwin" className="" />
        </div>
      ) : null}

      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex w-full flex-grow overflow-hidden max-lg:mt-16">
        {/* Sidebar */}
        <SideBar isSidebarOpen={isSidebarOpen} />

        {/* Rounded border illusion hack */}
        {/* Left */}
        <div
          className={cn(
            'hidden lg:block fixed top-18 w-6 h-6 z-50',
            isSidebarOpen
              ? 'min-[1440px]:left-[calc((100vw-1440px)/2+268px)] left-[276px]'
              : 'min-[1440px]:left-[calc((100vw-1440px)/2+78px)] left-[86px]',
            isResizing ? 'transition-none' : 'transition-all ease-in-out',
          )}
          style={{
            willChange: 'left',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-full h-full fill-header"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M0 0 H24 V24 H0 Z M0 24 A24 24 0 0 1 24 0 L24 24 Z"
            />
          </svg>
        </div>
        {/* Right */}
        <div
          className={cn(
            'hidden lg:block fixed top-18 w-6 h-6 z-50 -scale-x-100',
            isSidebarOpen
              ? 'min-[1440px]:right-[calc((100vw-1440px)/2-9px)] right-0'
              : 'min-[1440px]:right-[calc((100vw-1440px)/2-9px)] right-0',
            isResizing ? 'transition-none' : 'transition-all ease-in-out',
          )}
          style={{
            willChange: 'right',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-full h-full fill-header"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M0 0 H24 V24 H0 Z M0 24 A24 24 0 0 1 24 0 L24 24 Z"
            />
          </svg>
        </div>

        {/* Main frame */}
        <div
          className={cn(
            'flex flex-col w-full lg:mt-18 lg:min-h-[calc(100vh-72px)] overflow-hidden transition-all ease-in-out',
            isSidebarOpen ? openMargin : closedMargin,
          )}
          style={{ willChange: 'margin-left' }}
        >
          <main className="flex grow flex-col bg-white pb-12 lg:pb-34">
            {children}
          </main>
          {showFooter && <Footer />}

          <ScrollToTopButton />
        </div>
      </div>
    </div>
  );
};

const SideBar = ({ isSidebarOpen }: { isSidebarOpen: boolean }) => {
  const {
    user,
    session,
    currentSidebarTab: currentTab,
    setCurrentSidebarTab: setCurrentTab,
  } = useContext(AppContext);
  const { t } = useTranslation();
  const isLoggedIn = !!session?.user;

  const closedWidth = 'lg:w-[86px]';
  const openWidth = 'lg:w-[276px]';

  return (
    <nav
      className={cn(
        'fixed flex flex-col top-18 px-4 h-[calc(100vh-72px)] overflow-y-auto max-lg:hidden no-scrollbar transition-all ease-in-out gap-3',
        isSidebarOpen ? openWidth : closedWidth,
      )}
      // help the browser optimize the animation
      style={{ willChange: 'width' }}
    >
      {user &&
      (canAccess(UserRole.Admin)(user) ||
        canAccess(UserRole.Professor)(user)) ? (
        <SegmentedControl
          variant="outline"
          defaultValue={'learn'}
          value={currentTab}
          className={cn(isSidebarOpen ? '' : 'hidden')}
        >
          {canAccess(UserRole.Admin)(user) && (
            <SegmentedControlItem
              value={'admin'}
              key={'admin'}
              onClick={() => setCurrentTab('admin')}
            >
              <p className="w-29">{t('navbar.tabs.admin')}</p>
            </SegmentedControlItem>
          )}
          {user?.professorId && canAccess(UserRole.Professor)(user) && (
            <SegmentedControlItem
              value={'teach'}
              key={'teach'}
              onClick={() => setCurrentTab('teach')}
            >
              <p className="w-29">{t('navbar.tabs.teach')}</p>
            </SegmentedControlItem>
          )}
          <SegmentedControlItem
            value={'learn'}
            key={'learn'}
            onClick={() => setCurrentTab('learn')}
          >
            <p className="w-29">{t('navbar.tabs.learn')}</p>
          </SegmentedControlItem>
        </SegmentedControl>
      ) : null}

      {currentTab === 'learn' && (
        <>
          <div className="flex flex-col gap-1">
            <SideBarItem
              icon={BookOpen}
              iconColor="orange"
              label={t('navbar.learnAnytimeTitle')}
              description={t('navbar.learnAnytimeDescription')}
              link="/learn-anytime"
              isActive={window.location.pathname.includes('/learn-anytime')}
              isSidebarOpen={isSidebarOpen}
              isMain
            />
          </div>
          {isLoggedIn && (
            <>
              <div className="w-full max-w-[209px] mx-auto h-px bg-[#E8E8E8]" />
              <div className="flex flex-col gap-1">
                <SideBarItem
                  icon={Pages}
                  iconColor="blue"
                  label={t('navbar.myCourses')}
                  link="/dashboard/my-courses"
                  isActive={window.location.pathname.includes(
                    '/dashboard/course',
                  )}
                  isSidebarOpen={isSidebarOpen}
                />
                <SideBarItem
                  icon={Calendar}
                  iconColor="green"
                  label={t('navbar.myCalendar')}
                  link="/dashboard/calendar"
                  isActive={window.location.pathname.includes(
                    '/dashboard/calendar',
                  )}
                  isSidebarOpen={isSidebarOpen}
                />
                {user?.boughtCourses.some((courseId) =>
                  COURSES_CAREER_ACCESS.includes(courseId),
                ) ? (
                  <SideBarItem
                    icon={Luggage}
                    iconColor="purple"
                    label={t('navbar.myCareer')}
                    link="/dashboard/career-portal"
                    isActive={window.location.pathname.includes(
                      '/dashboard/career-portal',
                    )}
                    isSidebarOpen={isSidebarOpen}
                  />
                ) : null}
              </div>
              <div className="w-full max-w-[209px] mx-auto h-px bg-[#E8E8E8]" />
              <div className="flex flex-col gap-1">
                <SideBarItem
                  icon={Ticket}
                  iconColor="yellow"
                  label={'TEMP - Bookings'}
                  link="/dashboard/bookings"
                  isActive={window.location.pathname.includes(
                    '/dashboard/bookings',
                  )}
                  isSidebarOpen={isSidebarOpen}
                />
                <SideBarItem
                  icon={Medal}
                  iconColor="purple"
                  label={'TEMP - Credentials'}
                  link="/dashboard/credentials"
                  isActive={window.location.pathname.includes(
                    '/dashboard/credentials',
                  )}
                  isSidebarOpen={isSidebarOpen}
                />
              </div>
            </>
          )}

          <div className="w-full max-w-[209px] mx-auto h-px bg-[#E8E8E8]" />
          <div className="flex flex-col gap-1">
            <SideBarItem
              icon={TasksList}
              iconColor="blue"
              label={t('words.tutorials')}
              link="/tutorials"
              isActive={
                window.location.pathname.includes('/tutorials') &&
                !window.location.pathname.includes('/dashboard')
              }
              isSidebarOpen={isSidebarOpen}
            />
            <SideBarItem
              icon={BookCover}
              iconColor="purple"
              label={t('words.resources')}
              link="/resources"
              isActive={window.location.pathname.includes('/resources')}
              isSidebarOpen={isSidebarOpen}
            />
            <SideBarItem
              icon={PositionPin}
              iconColor="yellow"
              label={t('words.events')}
              link="/events"
              isActive={window.location.pathname.includes('/events')}
              isSidebarOpen={isSidebarOpen}
            />
            <SideBarItem
              icon={Medal}
              iconColor="green"
              label={t('words.bCert')}
              link="/b-cert"
              isActive={window.location.pathname.includes('/b-cert')}
              isSidebarOpen={isSidebarOpen}
            />
          </div>
        </>
      )}

      {currentTab === 'teach' && (
        <>
          <div className="flex flex-col gap-1">
            <SideBarItem
              icon={BookOpen}
              iconColor="orange"
              label={t('navbar.manageCourses')}
              link="/dashboard/professor/courses"
              isActive={window.location.pathname.includes(
                '/dashboard/professor/courses',
              )}
              isSidebarOpen={isSidebarOpen}
              isMain
            />
            <SideBarItem
              icon={Target}
              iconColor="green"
              label={t('navbar.analytics')}
              link="/dashboard/professor/tutorials"
              isActive={window.location.pathname.includes(
                '/dashboard/professor/tutorials',
              )}
              isSidebarOpen={isSidebarOpen}
              isMain
            />
          </div>
          <div className="w-full max-w-[209px] mx-auto h-px bg-[#E8E8E8]" />
          <div className="flex flex-col gap-1">
            <SideBarItem
              icon={PeopleFrame}
              iconColor="yellow"
              label={'TEMP - Teacher profile'}
              link="/dashboard/professor/profile"
              isActive={window.location.pathname.includes(
                '/dashboard/professor/profile',
              )}
              isSidebarOpen={isSidebarOpen}
              isMain
            />
          </div>
        </>
      )}

      {currentTab === 'admin' && (
        <div className="flex flex-col gap-1">
          <SideBarItem
            icon={PeopleFrame}
            iconColor="orange"
            label={t('navbar.userRolesAllocation')}
            link="/dashboard/administration/role"
            isActive={window.location.pathname.includes(
              '/dashboard/administration/role',
            )}
            isSidebarOpen={isSidebarOpen}
            isMain
          />
          <SideBarItem
            icon={ProjectPen}
            iconColor="purple"
            label={t('navbar.translationPanel')}
            link="/dashboard/administration/translation-panel"
            isActive={window.location.pathname.includes(
              '/dashboard/administration/translation-panel',
            )}
            isSidebarOpen={isSidebarOpen}
            isMain
          />
          <SideBarItem
            icon={Ticket}
            iconColor="green"
            label={t('navbar.tutorials')}
            link="/dashboard/administration/tutorials"
            isActive={window.location.pathname.includes(
              '/dashboard/administration/tutorials',
            )}
            isSidebarOpen={isSidebarOpen}
            isMain
          />
          <SideBarItem
            icon={Luggage}
            iconColor="blue"
            label={t('navbar.bookings')}
            link="/dashboard/administration/bookings"
            isActive={window.location.pathname.includes(
              '/dashboard/administration/bookings',
            )}
            isSidebarOpen={isSidebarOpen}
            isMain
          />
          <SideBarItem
            icon={Dollar}
            iconColor="purple"
            label={t('navbar.career')}
            link="/dashboard/administration/careers"
            isActive={window.location.pathname.includes(
              '/dashboard/administration/careers',
            )}
            isSidebarOpen={isSidebarOpen}
            isMain
          />
          <SideBarItem
            icon={Discount}
            iconColor="yellow"
            label={t('navbar.discountCode')}
            link="/dashboard/administration/coupons"
            isActive={window.location.pathname.includes(
              '/dashboard/administration/coupons',
            )}
            isSidebarOpen={isSidebarOpen}
            isMain
          />
        </div>
      )}
    </nav>
  );
};

type IconColor = 'orange' | 'blue' | 'purple' | 'yellow' | 'green';

interface SideBarItemProps {
  icon: IconType | React.FC<React.SVGProps<SVGSVGElement>>;
  iconColor: IconColor;
  label: string;
  description?: string;
  link: string;
  isActive?: boolean;
  isSidebarOpen: boolean;
  isMain?: boolean;
}

const iconVariants = cva('shrink-0', {
  variants: {
    color: {
      orange: 'fill-orange-300',
      blue: 'fill-blue-500',
      purple: 'fill-purple-500',
      yellow: 'fill-yellow-500',
      green: 'fill-green-300',
    },
  },
  defaultVariants: {
    color: 'orange',
  },
});

const iconBgVariants = cva(
  'shrink-0 flex items-center justify-center rounded-sm',
  {
    variants: {
      color: {
        orange: 'bg-orange-50',
        blue: 'bg-blue-50',
        purple: 'bg-purple-50',
        yellow: 'bg-yellow-50',
        green: 'bg-green-50',
      },
    },
    defaultVariants: {
      color: 'orange',
    },
  },
);

export const SideBarItem = ({
  icon,
  iconColor,
  label,
  description,
  link,
  isActive = false,
  isSidebarOpen,
  isMain = false,
}: SideBarItemProps) => {
  const IconComponent = icon;

  return (
    <Link
      to={link}
      className={cn(
        'flex items-center justify-center p-3 hover:bg-white rounded-lg',
        isActive ? 'bg-white' : 'bg-transparent',
        isSidebarOpen ? (isMain ? 'gap-3' : 'gap-4') : 'gap-0',
      )}
    >
      <div
        className={cn(
          isMain ? 'size-8' : 'size-6',
          iconBgVariants({ color: iconColor }),
        )}
      >
        <IconComponent
          className={cn('size-full p-1', iconVariants({ color: iconColor }))}
        />
      </div>

      <div
        className={cn(
          'overflow-hidden transition-all ',
          isSidebarOpen ? 'w-[200px] ml-2' : 'w-0 ml-0 opacity-0',
        )}
      >
        <div className="flex flex-col whitespace-nowrap">
          {description || isMain ? (
            <>
              <span
                className={cn(
                  'text-lg text-newBlack-1',
                  isActive && 'font-medium',
                  description && 'leading-none',
                )}
              >
                {label}
              </span>

              <span className="text-[10px] text-newBlack-1/30 leading-[120%]">
                {description}
              </span>
            </>
          ) : (
            <span
              className={cn(
                'text-newBlack-1',
                isActive ? 'subtitle-small-med-14px' : 'subtitle-small-14px',
              )}
            >
              {label}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
