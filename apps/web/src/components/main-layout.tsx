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
import { TbPointFilled, TbSearch } from 'react-icons/tb';
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
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.tsx';
import { isPearApp } from '../env.ts';
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
    <div className="flex flex-col bg-header w-full mx-auto relative">
      {/* Display titlebar on pear app */}
      {isPearApp ? (
        <div
          id="pear-ctrl-container"
          className="fixed top-0 left-0 w-full pt-4 pb-5 px-2 bg-[#ff5c00c3] z-50"
        >
          <pear-ctrl />
        </div>
      ) : null}

      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex w-full flex-grow overflow-hidden">
        {/* Sidebar */}
        <SideBar isSidebarOpen={isSidebarOpen} className="max-lg:hidden" />

        {/* Rounded border illusion hack */}
        {/* Left */}
        <div
          className={cn(
            'hidden lg:block fixed top-18 w-6 h-6 z-50',
            isSidebarOpen ? 'left-[276px]' : 'left-[86px]',
            isResizing ? 'transition-none' : 'transition-all ease-in-out',
          )}
          style={{
            willChange: 'left',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="hide-if-pear w-full h-full fill-header"
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
            'hidden lg:block fixed top-18 w-6 h-6 z-50 -scale-x-100 right-0',
          )}
          style={{
            willChange: 'right',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="hide-if-pear w-full h-full fill-header"
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
            'flex flex-col w-full overflow-hidden transition-all ease-in-out mt-15 lg:mt-18',
            isSidebarOpen ? openMargin : closedMargin,
          )}
          style={{ willChange: 'margin-left' }}
        >
          <main className="mt-if-pear flex grow flex-col bg-white min-h-[calc(100vh-64px)] lg:min-h-[calc(100vh-72px)] w-full relative">
            {children}
          </main>
          {showFooter && <Footer />}

          <ScrollToTopButton />
        </div>
      </div>
    </div>
  );
};

export const SideBar = ({
  isSidebarOpen,
  className,
}: {
  isSidebarOpen: boolean;
  className?: string;
}) => {
  const {
    user,
    session,
    tutorials,
    courses,
    currentSidebarTab: currentTab,
    setCurrentSidebarTab: setCurrentTab,
  } = useContext(AppContext);
  const { t } = useTranslation();
  const isLoggedIn = !!session?.user;

  const isMobile = useSmaller('lg') || window.innerWidth < 1024;

  const closedWidth = 'lg:w-[86px]';
  const openWidth = 'lg:w-[276px]';

  const hasWrittenTutorials =
    user?.professorId && tutorials
      ? tutorials.some((tutorial) => tutorial.professorId === user.professorId)
      : false;

  const professorCourses =
    courses &&
    user?.professorId &&
    user?.professorCourses
      .map((course) => courses.find((c) => c.id === course))
      .filter((c) => c !== undefined);

  return (
    <nav
      className={cn(
        'pt-if-pear lg:fixed flex flex-col top-18 lg:px-4 h-full lg:h-[calc(100vh-72px)] overflow-y-auto no-scrollbar transition-all ease-in-out gap-3 max-lg:w-full',
        isSidebarOpen ? openWidth : closedWidth,
        className,
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
          size={isMobile ? 'sm' : 'default'}
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
            <SideBarItem
              icon={BookOpen}
              iconColor="green"
              label={t('navbar.liveClassesTitle')}
              description={t('navbar.liveClassesDescription')}
              link="/live-classes"
              isActive={window.location.pathname.includes('/live-classes')}
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
                    '/dashboard/my-courses',
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
              label={t('words.certifications')}
              link="/certifications/b-cert"
              isActive={window.location.pathname.includes('certifications')}
              isSidebarOpen={isSidebarOpen}
            />
            {isLoggedIn && (
              <SideBarItem
                icon={Calendar}
                iconColor="blue"
                label={t('words.calendar')}
                link="/calendar"
                isActive={window.location.pathname.includes('/calendar')}
                isSidebarOpen={isSidebarOpen}
                className="lg:hidden"
              />
            )}
          </div>
        </>
      )}

      {currentTab === 'teach' && (
        <div className="flex flex-col gap-1">
          {professorCourses && professorCourses.length > 0 && (
            <SideBarItem
              icon={BookOpen}
              iconColor="orange"
              label={t('navbar.manageCourses')}
              isActive={window.location.pathname.includes(
                '/dashboard/professor/manage-courses',
              )}
              isSidebarOpen={isSidebarOpen}
              subElements={
                <div className="flex flex-col w-full gap-0.5">
                  {professorCourses.map((course) => (
                    <Link
                      key={course!.id}
                      to={`/dashboard/professor/manage-courses/${course.id}/overview`}
                      className={cn(
                        'flex items-center gap px-2 py-3 w-full text-neutral-800 hover:bg-neutral-50 hover:text-black rounded-lg',
                        window.location.pathname.includes(
                          `/dashboard/professor/manage-courses/${course!.id}`,
                        ) && 'bg-neutral-50 text-black',
                      )}
                    >
                      <TbPointFilled
                        className={cn(
                          'shrink-0',
                          (() => {
                            const now = new Date();
                            const start = course.startDate
                              ? new Date(course.startDate)
                              : null;
                            const end = course.endDate
                              ? new Date(course.endDate)
                              : null;

                            if (course.teachingFormat === 'self_paced') {
                              return 'text-yellow-400';
                            }

                            if (start && now < start) {
                              return 'text-brown-300';
                            }

                            if (end && now > end) {
                              return 'text-green-300';
                            }

                            return 'text-yellow-400';
                          })(),
                        )}
                        size={16}
                      />
                      <span
                        className="pl-2 body-small truncate"
                        title={course!.name}
                      >
                        {course.name}
                      </span>
                    </Link>
                  ))}
                </div>
              }
            />
          )}
          {hasWrittenTutorials && (
            <SideBarItem
              icon={Target}
              iconColor="green"
              label={t('words.tutorials')}
              link="/dashboard/professor/tutorials"
              isActive={window.location.pathname.includes(
                '/dashboard/professor/tutorials',
              )}
              isSidebarOpen={isSidebarOpen}
            />
          )}
        </div>
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
          />
        </div>
      )}

      <div className="w-full max-w-[209px] mx-auto h-px bg-[#E8E8E8] lg:hidden" />
      <Link
        className="flex gap-4 items-center p-3 py-2 w-full hover:bg-white rounded-lg lg:hidden"
        to="/search"
      >
        <TbSearch
          size={24}
          className="shrink-0 text-neutral-500"
          strokeWidth={1.5}
        />
        <span className="text-sm leading-relaxed">{t('words.search')}</span>
      </Link>
    </nav>
  );
};

type IconColor = 'orange' | 'blue' | 'purple' | 'yellow' | 'green';

interface SideBarItemProps {
  icon: IconType | React.FC<React.SVGProps<SVGSVGElement>>;
  iconColor: IconColor;
  label: string;
  description?: string;
  link?: string;
  isActive?: boolean;
  isSidebarOpen: boolean;
  isMain?: boolean;
  className?: string;
  subElements?: JSX.Element | JSX.Element[];
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
  className,
  subElements,
}: SideBarItemProps) => {
  const IconComponent = icon;

  const labelContainerRef = useRef<HTMLDivElement | null>(null);
  const labelTextRef = useRef<HTMLSpanElement | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [translatePx, setTranslatePx] = useState(0);

  const marqueeSpeedPxPerSec = 100;
  const singleDirectionDurationSec = translatePx
    ? translatePx / marqueeSpeedPxPerSec
    : 0.75;

  useEffect(() => {
    const measure = () => {
      const cont = labelContainerRef.current;
      const txt = labelTextRef.current;
      if (!cont || !txt) {
        setIsOverflowing(false);
        setTranslatePx(0);
        return;
      }

      const containerWidth = cont.clientWidth;
      const textWidth = txt.scrollWidth;

      if (textWidth > containerWidth + 1) {
        setIsOverflowing(true);
        setTranslatePx(textWidth - containerWidth);
      } else {
        setIsOverflowing(false);
        setTranslatePx(0);
      }
    };

    measure();

    const ro = new ResizeObserver(measure);
    if (labelContainerRef.current) ro.observe(labelContainerRef.current);
    if (labelTextRef.current) ro.observe(labelTextRef.current);
    window.addEventListener('resize', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [label, isSidebarOpen]);

  const wrapperClassName = cn(
    'flex flex-col hover:bg-white rounded-lg',
    isMain ? 'p-3' : 'px-3 py-2 lg:py-3',
    isActive ? 'bg-white' : 'bg-transparent',
    isSidebarOpen ? (isMain ? 'gap-3' : 'gap-3 lg:gap-4') : 'gap-0',
    className,
  );

  const inner = (
    <>
      <div className="flex items-center">
        <div
          className={cn(
            isMain ? 'size-8' : 'size-8 lg:size-6',
            iconBgVariants({ color: iconColor }),
          )}
        >
          <IconComponent
            className={cn('size-full p-1', iconVariants({ color: iconColor }))}
          />
        </div>

        <div
          className={cn(
            'overflow-hidden transition-all',
            isSidebarOpen ? 'w-full ml-3 lg:ml-2' : 'w-0 ml-0 opacity-0',
          )}
        >
          <div className="flex flex-col whitespace-nowrap">
            <div
              ref={labelContainerRef}
              className={cn('relative w-full overflow-hidden')}
              aria-hidden={false}
            >
              <span
                ref={labelTextRef}
                style={
                  {
                    ['--marquee-translate' as string]: `-${translatePx}px`,
                    animationDuration:
                      isHovered && isOverflowing
                        ? `${singleDirectionDurationSec}s`
                        : undefined,
                  } as React.CSSProperties
                }
                className={cn(
                  'align-middle whitespace-nowrap max-lg:leading-none text-newBlack-1',
                  description || isMain
                    ? 'text-lg'
                    : isActive
                      ? 'subtitle-small-med-14px'
                      : 'subtitle-small-14px',
                  isHovered && isOverflowing
                    ? 'marquee-active inline-block'
                    : 'truncate block',
                  isActive && 'font-medium',
                )}
              >
                {label}
              </span>
            </div>

            {description && (
              <span className="text-[10px] text-newBlack-1/30 leading-[120%]">
                {description}
              </span>
            )}
          </div>
        </div>
      </div>
      {isSidebarOpen && subElements}
    </>
  );

  if (subElements) {
    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={wrapperClassName}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      to={link}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={wrapperClassName}
    >
      {inner}
    </Link>
  );
};
