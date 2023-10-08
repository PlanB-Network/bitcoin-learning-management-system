import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';

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
              className="h-6 w-6 text-blue-700 group-hover:text-blue-700"
              aria-hidden="true"
            />
          </div>
        )}
        <div className="flex flex-col items-start justify-center">
          <h5 className="text-left text-sm font-semibold text-blue-700">
            {element.title}
          </h5>
          {element.description && (
            <p className="mt-1 text-left text-xs text-blue-700">
              {element.description}
            </p>
          )}
        </div>
      </div>
    ),
    [element],
  );

  return 'path' in element ? (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <Link className="block w-full text-blue-800" to={element.path}>
      {item}
    </Link>
  ) : (
    <button className="block w-full text-blue-800" onClick={element.action}>
      {item}
    </button>
  );
};
