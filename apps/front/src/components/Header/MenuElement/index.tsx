import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { NavigationElement } from '../props';

export interface MenuElementProps {
  element: NavigationElement;
}

export const MenuElement = ({ element }: MenuElementProps) => {
  const item = useMemo(
    () => (
      <div
        key={element.id}
        className="flex relative gap-x-6 p-4 w-full rounded-lg duration-100 cursor-pointer group hover:bg-gray-100"
      >
        {element.icon && (
          <div className="flex flex-none justify-center items-center mt-1 w-11 h-11 bg-gray-100 rounded-lg duration-200 group-hover:bg-white">
            <element.icon
              className="w-6 h-6 text-gray-600 group-hover:text-primary-700"
              aria-hidden="true"
            />
          </div>
        )}
        <div>
          <h5 className="text-sm font-semibold text-left text-gray-600">
            {element.title}
          </h5>
          {element.description && (
            <p className="mt-1 text-xs text-left text-gray-600">
              {element.description}
            </p>
          )}
        </div>
      </div>
    ),
    [element]
  );

  return 'path' in element ? (
    <Link className="block w-full" to={element.path}>
      {item}
    </Link>
  ) : (
    <button className="block w-full" onClick={element.action}>
      {item}
    </button>
  );
};
