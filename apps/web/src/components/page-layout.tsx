import { Button, cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { type ReactNode, useContext, useLayoutEffect, useState } from 'react';
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
  layoutSize?: 'base' | 'wide' | 'max';
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
  const isMobile = useSmaller('lg');

  const layoutSizeClassesMap = {
    base: 'max-w-[832px]',
    wide: 'max-w-[1112px]',
    max: '',
  };

  const [navbarHeight, setNavbarHeight] = useState(0);

  useLayoutEffect(() => {
    const navbar = document.getElementById('navbar-mainframe');
    if (!navbar) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setNavbarHeight(entry.target.clientHeight);
      }
    });

    resizeObserver.observe(navbar);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <MainLayout>
      {/** biome-ignore lint/complexity/noUselessFragments: <N/A> */}
      <>
        <div
          className={cn(
            'fixed z-40 bg-white top-15 lg:top-18 right-0',
            isMobile
              ? 'left-0'
              : isSidebarOpen
                ? 'left-[276px]'
                : 'left-[86px]',
          )}
          id="navbar-mainframe"
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
