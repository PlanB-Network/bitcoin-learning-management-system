import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';

import { cn } from '@blms/ui';

import type { NavigationElement } from './props.ts';

export interface MenuElementProps {
  element: NavigationElement;
  variant?: 'dark' | 'light';
  isMultipleSubSectionChildren?: boolean;
}

export const MenuElement = ({
  element,
  variant,
  isMultipleSubSectionChildren,
}: MenuElementProps) => {
  const item = useMemo(
    () => (
      <div
        key={element.id}
        className={cn(
          'group flex w-full cursor-pointer gap-5 rounded-md py-2 px-2.5',
          variant === 'light' ? 'hover:bg-darkOrange-1' : 'hover:bg-white/10',
        )}
      >
        {element.icon && (
          <div className="flex flex-none items-center justify-center">
            <img
              src={element.icon}
              className={cn(
                'size-[30px]',
                variant === 'light'
                  ? 'text-black brightness-0'
                  : 'text-white filter-white',
              )}
              aria-hidden="true"
              alt=""
            />
          </div>
        )}
        <div className="flex flex-col items-start justify-center truncate">
          <h5
            className={cn(
              'text-lg leading-normal tracking-015px',
              variant === 'light' ? 'text-black' : 'text-white',
            )}
          >
            {element.title}
          </h5>
          {element.description && (
            <p
              className={cn(
                'truncate desktop-typo1 max-w-full',
                variant === 'light' ? 'text-black' : 'text-newGray-2',
                isMultipleSubSectionChildren
                  ? 'w-40 xl:w-[240px] 2xl:w-[316px]'
                  : 'w-[316px]',
              )}
            >
              {element.description}
            </p>
          )}
        </div>
      </div>
    ),
    [element, variant, isMultipleSubSectionChildren],
  );

  return 'path' in element ? (
    // @ts-ignore
    <Link
      className="block w-full text-black"
      to={element.path}
      search={element.search}
    >
      {item}
    </Link>
  ) : (
    <button
      onClick={element.action}
      type="button"
      className="block w-full text-black"
    >
      {item}
    </button>
  );
};
