import { Button, cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

interface Props {
  title?: string;
  children?: ReactNode;
  className?: string;
  tabs?: { id: string; label: string; href: string }[];
  backLink?: { text: string; href: string };
  actionButtons?:
    | { text: string; onClick?: () => void; href?: string }[]
    | React.ReactNode[];
  layoutSize?: 'base' | 'wide' | 'max';
}

export const PageLayout = ({
  title,
  children,
  className,
  tabs = [],
  backLink,
  actionButtons = [],
  layoutSize = 'max',
}: Props) => {
  // const { isSidebarOpen } = useContext(AppContext);
  // const isMobile = useSmaller('lg') || window.innerWidth < 1024;

  const layoutSizeClassesMap = {
    base: 'max-w-[832px]',
    wide: 'max-w-[1112px]',
    max: '',
  };

  const navbarHeight = tabs.length > 0 || backLink ? 48 : 0;

  return (
    <div>
      {/** biome-ignore lint/complexity/noUselessFragments: <N/A> */}
      <>
        <div
          className={cn(
            'fixed z-30 bg-white top-15 lg:top-18 lg:rounded-t-2xl',
          )}
          id="navbar-mainframe"
          style={{ willChange: 'left, right' }}
        >
          {backLink && (
            <Link
              className="w-fit flex items-center p-4 text-neutral-500 body-small-bold"
              to={backLink.href}
            >
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
                      <Button variant="newTertiary" asChild>
                        <Link to={button.href} target="_blank" rel="noreferrer">
                          {button.text}
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="newTertiary" onClick={button.onClick}>
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
          <div className="flex flex-row justify-between gap-2">
            <span>PLAN B NETWORK</span>
            <div className="flex flew-row gap-2">
              <a href="/academy">Academy</a>
              <a href="/hubs">Hubs</a>
              <a href="/funds">Funds</a>
            </div>
            <div className="flex flew-row gap-2">
              <a href="/about">About</a>
              <a href="/news">News</a>
              <span>LANG</span>
            </div>
          </div>
          {title && <p>Page header</p>}
          {children && <div>{children}</div>}
        </div>
      </div>
    </div>
  );
};
