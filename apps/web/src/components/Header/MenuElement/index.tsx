import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';

import { NavigationElement } from '../props';

export interface MenuElementProps {
  element: NavigationElement;
}

export const MenuElement = ({ element }: MenuElementProps) => {
  const item = useMemo(
    () => (
      <div
        key={element.id}
        className="group relative flex w-full max-w-sm cursor-pointer gap-x-6 rounded-lg p-4 duration-100 hover:bg-gray-100"
      >
        {element.icon && (
          <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-100 duration-200 group-hover:bg-white">
            <element.icon
              className="group-hover:text-primary-700 h-6 w-6 text-gray-600"
              aria-hidden="true"
            />
          </div>
        )}
        <div className="flex flex-col items-start justify-center">
          <h5 className="text-left text-sm font-semibold text-gray-600">
            {element.title}
          </h5>
          {element.description && (
            <p className="mt-1 text-left text-xs text-gray-600">
              {element.description}
            </p>
          )}
        </div>
      </div>
    ),
    [element]
  );

  return 'path' in element ? (
    // @ts-ignore
    <Link className="text-primary-800 block w-full" to={element.path}>
      {item}
    </Link>
  ) : (
    <button className="text-primary-800 block w-full" onClick={element.action}>
      {item}
    </button>
  );
};
