import { UserRole } from '@blms/constants';
import { COURSES_CAREER_ACCESS, canAccess } from '@blms/shared';
import { cn, SegmentedControl, SegmentedControlItem } from '@blms/ui';
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
import EducatorContent from '#src/assets/icons/pixelated/navbar/educator_content.svg?react';
import Location from '#src/assets/icons/pixelated/navbar/location.svg?react';
import Luggage from '#src/assets/icons/pixelated/navbar/luggage.svg?react';
import Medal from '#src/assets/icons/pixelated/navbar/medal.svg?react';
import PeopleFrame from '#src/assets/icons/pixelated/navbar/people_frame.svg?react';
import ProjectPen from '#src/assets/icons/pixelated/navbar/project_pen.svg?react';
import Replay from '#src/assets/icons/pixelated/navbar/replay.svg?react';
import Target from '#src/assets/icons/pixelated/navbar/target.svg?react';
import TasksList from '#src/assets/icons/pixelated/navbar/tasks_list.svg?react';
import Teacher from '#src/assets/icons/pixelated/navbar/teacher.svg?react';
import Ticket from '#src/assets/icons/pixelated/navbar/ticket.svg?react';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.tsx';

export const SideBarContent = ({
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
      .filter((c) => c !== undefined)
      .sort(
        (a, b) =>
          (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
      );

  const path = window.location.pathname;
  const isOnAdminPage = path.includes('/dashboard/administration');
  const isOnProfessorPage = path.includes('/dashboard/professor');

  return (
    <nav
      className={cn(
        'pt-if-pear lg:fixed flex flex-col top-18 lg:px-4 h-full lg:h-[calc(100vh-72px)] overflow-y-auto no-scrollbar transition-all ease-in-out gap-3 max-lg:w-full bg-header',
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
          defaultValue={
            isOnAdminPage ? 'admin' : isOnProfessorPage ? 'teach' : 'learn'
          }
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
          {isLoggedIn && (
            <>
              <div className="flex flex-col gap-1">
                <SideBarItem
                  icon={BookOpen}
                  iconColor="orange"
                  label={t('navbar.myCourses')}
                  link="/my-courses"
                  isActive={window.location.pathname.includes('/my-courses')}
                  isSidebarOpen={isSidebarOpen}
                  isMain
                />
              </div>
              <div className="w-full max-w-[209px] mx-auto h-px bg-[#E8E8E8]" />
            </>
          )}

          <div className="flex flex-col gap-1">
            <SideBarItem
              icon={Replay}
              iconColor="orange"
              label={t('navbar.learnAnytimeTitle')}
              description={t('navbar.learnAnytimeDescription')}
              link="/learn-anytime"
              isActive={window.location.pathname.includes('/learn-anytime')}
              isSidebarOpen={isSidebarOpen}
              isMain
            />
            <SideBarItem
              icon={Teacher}
              iconColor="orange"
              label={t('navbar.liveClassesTitle')}
              description={t('navbar.liveClassesDescription')}
              link="/live-classes"
              isActive={window.location.pathname.includes('/live-classes')}
              isSidebarOpen={isSidebarOpen}
              isMain
            />
          </div>

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
              iconColor="blue"
              label={t('words.resources')}
              link="/resources"
              isActive={window.location.pathname.includes('/resources')}
              isSidebarOpen={isSidebarOpen}
            />
            <SideBarItem
              icon={Location}
              iconColor="blue"
              label={t('words.events')}
              link="/events"
              isActive={window.location.pathname.includes('/events')}
              isSidebarOpen={isSidebarOpen}
            />
            <SideBarItem
              icon={Medal}
              iconColor="blue"
              label={t('words.certifications')}
              link="/certifications/certificates"
              isActive={window.location.pathname.includes('certifications')}
              isSidebarOpen={isSidebarOpen}
            />

            {isLoggedIn ? (
              <SideBarItem
                icon={Calendar}
                iconColor="blue"
                label={t('words.calendar')}
                link="/calendar"
                isActive={window.location.pathname.includes('/calendar')}
                isSidebarOpen={isSidebarOpen}
                className="lg:hidden"
              />
            ) : null}
            {user?.boughtCourses.some((courseId) =>
              COURSES_CAREER_ACCESS.includes(courseId),
            ) ? (
              <SideBarItem
                icon={Luggage}
                iconColor="blue"
                label={t('navbar.careers')}
                link="/career-portal"
                isActive={window.location.pathname.includes('/career-portal')}
                isSidebarOpen={isSidebarOpen}
              />
            ) : null}
            {process.env.NODE_ENV === 'development' ? (
              <>
                <div className="w-full max-w-[209px] mx-auto h-px bg-[#E8E8E8]" />
                <SideBarItem
                  icon={EducatorContent}
                  iconColor="blue"
                  label={t('menu.educatorContent')}
                  link="/educator-content"
                  isActive={window.location.pathname.includes(
                    'educator-content',
                  )}
                  isSidebarOpen={isSidebarOpen}
                />
              </>
            ) : null}
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
              isMain
            />
          )}
          {hasWrittenTutorials && (
            <SideBarItem
              icon={Target}
              iconColor="orange"
              label={t('navbar.tutorialsAnalytics')}
              link="/dashboard/professor/tutorials"
              isActive={window.location.pathname.includes(
                '/dashboard/professor/tutorials',
              )}
              isSidebarOpen={isSidebarOpen}
              isMain
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
            isMain
          />
          <SideBarItem
            icon={ProjectPen}
            iconColor="orange"
            label={t('navbar.translationPanel')}
            link="/dashboard/administration/translation-panel"
            isActive={window.location.pathname.includes(
              '/dashboard/administration/translation-panel',
            )}
            isSidebarOpen={isSidebarOpen}
            isMain
          />
          <SideBarItem
            icon={TasksList}
            iconColor="orange"
            label={t('navbar.tutorials')}
            link="/dashboard/administration/tutorials"
            isActive={window.location.pathname.includes(
              '/dashboard/administration/tutorials',
            )}
            isSidebarOpen={isSidebarOpen}
            isMain
          />
          <SideBarItem
            icon={Ticket}
            iconColor="orange"
            label={t('navbar.bookings')}
            link="/dashboard/administration/bookings"
            isActive={window.location.pathname.includes(
              '/dashboard/administration/bookings',
            )}
            isSidebarOpen={isSidebarOpen}
            isMain
          />
          <SideBarItem
            icon={Luggage}
            iconColor="orange"
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
            iconColor="orange"
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

type IconColor = 'orange' | 'blue';

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
      orange: 'fill-orange-400',
      blue: 'fill-blue-400',
    },
  },
  defaultVariants: {
    color: 'orange',
  },
});

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
            'shrink-0 flex items-center justify-center rounded-sm',
            isMain ? 'size-7' : 'size-7 lg:size-6.5',
          )}
        >
          <IconComponent
            className={cn('size-full', iconVariants({ color: iconColor }))}
          />
        </div>

        <div
          className={cn(
            'overflow-hidden transition-all',
            isSidebarOpen
              ? isMain
                ? 'w-full ml-3'
                : 'w-full ml-4'
              : 'w-0 ml-0 opacity-0',
          )}
        >
          <div
            className={cn(
              'flex flex-col whitespace-nowrap',
              isMain && 'h-9 flex justify-center',
            )}
          >
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
                  'align-middle whitespace-nowrap text-newBlack-1 inline-block',
                  description || isMain
                    ? 'text-lg'
                    : isActive
                      ? 'subtitle-small-med-14px'
                      : 'subtitle-small-14px',
                  isHovered && isOverflowing ? 'marquee-active' : 'truncate',
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
