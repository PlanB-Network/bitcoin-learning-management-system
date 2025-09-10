import { cn } from '@blms/ui';
import { Link, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

interface Tab {
  id: string;
  label: string;
  href: string;
}

export const SecondaryNavbar = ({ tabs }: { tabs: Tab[] }) => {
  const { t, i18n } = useTranslation();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const activeTab = tabs.reduce<Tab | null>((best, tab) => {
    const tabPath = `/${i18n.language}${tab.href}`;
    if (pathname === tabPath || pathname.startsWith(tabPath + '/')) {
      if (!best || tabPath.length > `/${i18n.language}${best.href}`.length) {
        return tab;
      }
    }
    return best;
  }, null);

  return (
    <div
      className="w-full flex items-center border-b border-neutral-100 px-3 lg:px-6 pt-2 lg:pt-4"
      role="tablist"
    >
      <div className="flex items-center gap-4.5 lg:gap-6">
        {tabs.map((tab) => {
          const isActive = activeTab?.id === tab.id;

          return (
            <Link
              key={tab.id}
              to={tab.href}
              className={cn(
                'relative pb-2 group',
                isActive
                  ? 'text-newBlack-1 body-small-bold lg:label-strong'
                  : 'body-small lg:label text-newBlack-3 group-hover:text-newBlack-1',
              )}
            >
              {t(tab.label)}

              <div
                className={cn(
                  'absolute bottom-0 left-0 h-1 w-full rounded-full bg-orange-100 scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-75',
                  isActive && 'scale-x-100 bg-orange-500',
                )}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
};
