import { Button, cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { type ReactNode, useContext } from 'react';
import type { IconType } from 'react-icons/lib';
import { TbChevronLeft } from 'react-icons/tb';
import { PageHeader } from '#src/components/page-header.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.tsx';
import PageMeta from './Head/PageMeta/index.tsx';
import { MainLayout } from './main-layout.tsx';
import { SecondaryNavbar } from './ui/secondary-navbar.tsx';

interface Props {
  navbarTitle?: ReactNode;
  title?: string;
  overTitle?: ReactNode;
  overTitleMobile?: string;
  subtitle?: string;
  hideTitle?: boolean;
  description?: string;
  link?: string;
  children?: ReactNode;
  className?: string;
  tabs?: {
    id: string;
    label: string;
    href: string;
    notificationAmount?: number;
  }[];
  backLink?: { text: string; href: string };
  actionButtons?:
    | {
        text: string;
        onClick?: () => void;
        href?: string;
        tooltipText?: string;
      }[]
    | React.ReactNode[];
  layoutSize?: 'small' | 'base' | 'wide' | 'max';
  icon?: IconType | ReactNode;
  showBecomeTeacherButton?: boolean;
}

export const PageLayout = ({
  navbarTitle,
  title,
  overTitle,
  overTitleMobile,
  subtitle,
  hideTitle,
  description,
  link,
  children,
  className,
  tabs = [],
  backLink,
  actionButtons = [],
  layoutSize = 'max',
  icon: Icon,
  showBecomeTeacherButton,
}: Props) => {
  const { isSidebarOpen } = useContext(AppContext);
  const isMobile = useSmaller('lg') || window.innerWidth < 1024;

  const layoutSizeClassesMap = {
    small: 'max-w-[536px]',
    base: 'max-w-[832px]',
    wide: 'max-w-[1112px]',
    max: 'max-w-[1644px]',
  };

  const navbarHeight = tabs.length > 0 || backLink ? (isMobile ? 37 : 48) : 0;

  const ActionButtons = () => (
    <div className="flex items-center gap-1">
      {actionButtons.map((button, index) => {
        if (typeof button === 'object' && button !== null && 'text' in button) {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: <N/A>
            <div key={index} className="relative flex flex-col items-center">
              {button.href ? (
                <Button variant="newTertiary" size={'s'} asChild rounded>
                  <Link to={button.href} target="_blank" rel="noreferrer">
                    {button.text}
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="newTertiary"
                  size={'s'}
                  onClick={button.onClick}
                  rounded
                >
                  {button.text}
                </Button>
              )}

              {button.tooltipText && (
                <div className="hidden lg:flex absolute -bottom-8.5 flex-col items-center pointer-events-none">
                  {/** biome-ignore lint/a11y/noSvgWithoutTitle: <N/A> */}
                  <svg
                    width="9"
                    height="5"
                    viewBox="0 0 9 5"
                    className="fill-yellow-50 translate-y-px"
                  >
                    <path d="M4.5 0L9 5H0L4.5 0Z" />
                  </svg>
                  <div className="bg-yellow-50 px-3 py-1.5 rounded-full shadow-none text-xs text-center text-neutral-800 whitespace-nowrap">
                    {button.tooltipText}
                  </div>
                </div>
              )}
            </div>
          );
        }
        // biome-ignore lint/suspicious/noArrayIndexKey: <N/A>
        return <div key={index}>{button}</div>;
      })}
    </div>
  );

  return (
    <MainLayout
      showBecomeTeacherButton={showBecomeTeacherButton}
      navbarTitle={navbarTitle}
    >
      <PageMeta title={title} description={description} />
      {/** biome-ignore lint/complexity/noUselessFragments: <N/A> */}
      <>
        <div
          className={cn(
            'mt-if-pear fixed z-30 bg-white top-14 lg:top-18 lg:rounded-t-2xl',
            isMobile
              ? 'left-0 right-0'
              : isSidebarOpen
                ? 'left-[276px] right-0 transition-all'
                : 'left-[86px] right-0 transition-all',
          )}
          id="navbar-mainframe"
          style={{ willChange: 'left, right' }}
        >
          {tabs.length > 0 && <SecondaryNavbar tabs={tabs} />}

          {backLink && (
            <div className="flex w-full items-center justify-between pr-4 md:pr-6">
              <Link
                className="w-fit flex items-center pl-3 pr-4 py-2 mt-1.5 ml-1 text-neutral-500 body-base-bold hover:bg-neutral-50 hover:text-black rounded-full"
                to={backLink.href}
              >
                <TbChevronLeft size={24} className="shrink-0" />
                {backLink.text}
              </Link>

              {actionButtons.length > 0 && (
                <div className="mt-1.5">
                  <ActionButtons />
                </div>
              )}
            </div>
          )}
        </div>

        {!backLink && actionButtons && actionButtons.length > 0 ? (
          <div
            className="flex items-center gap-1 ml-auto py-2 px-2 md:px-6"
            style={{ marginTop: navbarHeight }}
          >
            <ActionButtons />
          </div>
        ) : null}
      </>

      <div
        className={cn(
          'flex h-fit justify-center px-3 md:px-12 pb-16 md:pb-40 mx-auto w-full',
          layoutSizeClassesMap[layoutSize],
          className,
          !backLink && actionButtons.length > 0 ? '' : 'pt-4 md:pt-12',
        )}
        style={{
          marginTop: !backLink && actionButtons.length > 0 ? 0 : navbarHeight,
        }}
      >
        <div className={cn('w-full')}>
          {overTitle}
          {overTitleMobile ? (
            <span className="lg:hidden text-neutral-400 body-small-bold">
              {overTitleMobile}
            </span>
          ) : null}
          <div className="flex items-center gap-6">
            {Icon ? (
              typeof Icon === 'function' ? (
                <Icon className="shrink-0 size-8 md:size-10 text-orange-500 mb-2 md:mb-6" />
              ) : (
                Icon
              )
            ) : null}
            {title && !hideTitle && (
              <PageHeader
                title={title}
                subtitle={subtitle}
                description={description}
                link={link}
              />
            )}
          </div>
          {children && <div>{children}</div>}
        </div>
      </div>
    </MainLayout>
  );
};
