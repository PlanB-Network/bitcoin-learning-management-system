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
          'group flex w-full cursor-pointer gap-5 rounded-md p-2',
          variant === 'light' ? 'hover:bg-white/20' : 'hover:bg-white/10',
        )}
      >
        {element.icon && (
          <div className="flex flex-none items-center justify-center w-8">
            <img
              src={element.icon}
              className={cn(
                'size-[30px]',
                variant === 'light'
                  ? 'text-darkOrange-10 brightness-0'
                  : 'text-white filter-white',
              )}
              aria-hidden="true"
              alt=""
            />
          </div>
        )}
        <div className="flex flex-col items-start justify-center">
          <h5
            className={cn(
              'text-lg leading-normal tracking-015px',
              variant === 'light' ? 'text-darkOrange-10' : 'text-white',
            )}
          >
            {element.title}
          </h5>
          {element.description && (
            <p
              className={cn(
                'truncate desktop-typo1 ',
                variant === 'light' ? 'text-darkOrange-8' : 'text-newGray-2',
                isMultipleSubSectionChildren
                  ? 'max-w-40 xl:max-w-[346px]'
                  : 'max-w-72 xl:max-w-[346px]',
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <Link className="block w-full text-black" to={element.path}>
      {item}
    </Link>
  ) : (
    <button className="block w-full text-black" onClick={element.action}>
      {item}
    </button>
  );
};
