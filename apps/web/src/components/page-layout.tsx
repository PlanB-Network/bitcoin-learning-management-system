import { Button, cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { type ReactNode, useContext } from 'react';
import type { IconType } from 'react-icons/lib';
import { TbChevronLeft } from 'react-icons/tb';
import { PageHeader } from '#src/components/page-header.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.tsx';
import { MainLayout } from './main-layout.tsx';
import { SecondaryNavbar } from './ui/secondary-navbar.tsx';

interface Props {
  title?: string;
  subtitle?: string;
  description?: string;
  link?: string;
  children?: ReactNode;
  className?: string;
  tabs?: { id: string; label: string; href: string }[];
  backLink?: { text: string; href: string };
  actionButtons?:
    | { text: string; onClick?: () => void; href?: string }[]
    | React.ReactNode[];
  layoutSize?: 'small' | 'base' | 'wide' | 'max';
  icon?: IconType | ReactNode;
}

export const PageLayout = ({
  title,
  subtitle,
  description,
  link,
  children,
  className,
  tabs = [],
  backLink,
  actionButtons = [],
  layoutSize = 'max',
  icon: Icon,
}: Props) => {
  const { isSidebarOpen } = useContext(AppContext);
  const isMobile = useSmaller('lg') || window.innerWidth < 1024;

  const layoutSizeClassesMap = {
    small: 'max-w-[440px]',
    base: 'max-w-[832px]',
    wide: 'max-w-[1112px]',
    max: '',
  };

  const navbarHeight = tabs.length > 0 || backLink ? (isMobile ? 37 : 48) : 0;

  return (
    <MainLayout>
      {/** biome-ignore lint/complexity/noUselessFragments: <N/A> */}
      <>
        <div
          className={cn(
            'fixed z-30 bg-white top-14 lg:top-18 lg:rounded-t-2xl',
            isMobile
              ? 'left-0 right-0'
              : isSidebarOpen
                ? 'min-[1934px]:left-[calc((100%-1920px)/2+276px)] left-[276px] min-[1934px]:right-[calc((100%-1920px)/2)] right-0 transition-all'
                : 'min-[1934px]:left-[calc((100%-1920px)/2+86px)] left-[86px] min-[1934px]:right-[calc((100%-1920px)/2)] right-0 transition-all',
          )}
          id="navbar-mainframe"
          style={{ willChange: 'left, right' }}
        >
          {tabs.length > 0 && <SecondaryNavbar tabs={tabs} />}
          {backLink && (
            <Link
              className="w-fit flex items-center p-4 text-neutral-500 body-small-bold"
              to={backLink.href}
            >
              <TbChevronLeft size={24} className="shrink-0" />
              {backLink.text}
            </Link>
          )}
        </div>
        {actionButtons && actionButtons.length > 0 ? (
          <div
            className="flex items-center gap-1 ml-auto p-2"
            style={{ marginTop: navbarHeight }}
          >
            {actionButtons.map((button, index) => {
              if (
                typeof button === 'object' &&
                button !== null &&
                'text' in button
              ) {
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <N/A>
                  <div key={index}>
                    {button.href ? (
                      <Button
                        variant="newTertiary"
                        size={isMobile ? 's' : 'm'}
                        asChild
                      >
                        <Link to={button.href} target="_blank" rel="noreferrer">
                          {button.text}
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        variant="newTertiary"
                        size={isMobile ? 's' : 'm'}
                        onClick={button.onClick}
                      >
                        {button.text}
                      </Button>
                    )}
                  </div>
                );
              }

              // biome-ignore lint/suspicious/noArrayIndexKey: <N/A>
              return <div key={index}>{button}</div>;
            })}
          </div>
        ) : null}
      </>
      <div
        className={cn(
          'flex h-fit justify-center px-3 md:px-12 pb-16 md:pb-40 mx-auto w-full',
          layoutSizeClassesMap[layoutSize],
          className,
          actionButtons.length > 0 ? 'pt-2' : 'pt-4 md:pt-12',
        )}
        style={{ marginTop: actionButtons.length > 0 ? 0 : navbarHeight }}
      >
        <div className={cn('w-full')}>
          <div className="flex items-center gap-6">
            {Icon ? (
              typeof Icon === 'function' ? (
                <Icon className="shrink-0 size-8 md:size-10 text-orange-500 mb-2 md:mb-6" />
              ) : (
                Icon
              )
            ) : null}
            {title && (
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
