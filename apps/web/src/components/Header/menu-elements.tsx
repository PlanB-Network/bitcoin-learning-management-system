import { cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';

import type { NavigationElement } from './props.ts';

export interface MenuElementProps {
  element: NavigationElement;
  isMultipleSubSectionChildren?: boolean;
  rtl?: boolean;
}

export const MenuElement = ({
  element,
  isMultipleSubSectionChildren,
  rtl,
}: MenuElementProps) => {
  const item = useMemo(
    () => (
      <div
        key={element.id}
        className={cn(
          'group flex w-full cursor-pointer gap-5 rounded-md py-2 px-2.5 hover:bg-darkOrange-1',
        )}
      >
        {element.icon && (
          <div className="flex flex-none items-center justify-center">
            <img
              src={element.icon}
              className="size-[30px] text-black brightness-0"
              aria-hidden="true"
              alt=""
            />
          </div>
        )}
        <div className="flex flex-col items-start justify-center truncate">
          <h5 className="text-lg leading-normal tracking-015px text-black">
            {element.title}
          </h5>
          {element.description && (
            <p
              className={cn(
                'truncate desktop-typo1 max-w-full text-black',
                isMultipleSubSectionChildren
                  ? 'w-40 xl:w-[240px] 2xl:w-[316px]'
                  : 'w-[316px]',
                rtl && 'text-right',
              )}
            >
              {element.description}
            </p>
          )}
        </div>
      </div>
    ),
    [element, isMultipleSubSectionChildren],
  );

  return 'path' in element ? (
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
