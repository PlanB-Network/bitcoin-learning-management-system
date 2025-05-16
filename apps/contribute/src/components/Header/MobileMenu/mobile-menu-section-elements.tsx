import { Link } from '@tanstack/react-router';

import { cn } from '@blms/ui';

import type { NavigationElementMobile } from '../props.ts';

export interface MobileMenuSectionElementProps {
  element: NavigationElementMobile;
}

export const MobileMenuSectionElement = ({
  element,
}: MobileMenuSectionElementProps) => {
  return 'action' in element ? (
    <button
      type="button"
      onClick={element.action}
      className="group flex items-center text-maroon-9 dark:text-white body-16px pr-2 pl-10 py-[5px] gap-[15px] w-full"
    >
      {typeof element.icon === 'string' ? (
        <img
          src={element.icon}
          alt={element.title}
          className={cn(
            'size-5 shrink-0',
            element.removeFilterOnIcon ? '' : ' filter-black dark:filter-white',
          )}
        />
      ) : (
        element.icon
      )}
      <span className="truncate">{element.title}</span>
    </button>
  ) : (
    <Link
      className="group flex items-center text-maroon-9 dark:text-white body-16px pr-2 pl-10 py-[5px] gap-[15px] w-full"
      to={element.path}
    >
      {typeof element.icon === 'string' ? (
        <img
          src={element.icon}
          alt={element.title}
          className={cn(
            'size-5 shrink-0',
            element.removeFilterOnIcon ? '' : ' filter-black dark:filter-white',
          )}
        />
      ) : (
        element.icon
      )}
      <span className="truncate">{element.title}</span>
    </Link>
  );
};
