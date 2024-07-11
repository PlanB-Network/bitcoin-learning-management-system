import { useEffect, useRef, useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { cn } from '@blms/ui';

import { DropdownItem } from './dropdown-item.tsx';

interface ItemProps {
  name: string;
  link?: string;
  onClick?: () => void;
}

interface DropdownMenuProps {
  activeItem: string;
  itemsList: ItemProps[];
  maxWidth?: string;
  variant?: 'default' | 'gray';
}

export const DropdownMenu = ({
  activeItem,
  itemsList,
  maxWidth = 'max-w-[280px]',
  variant = 'default',
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDropdown = () => setIsOpen(!isOpen);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  const handleItemClick = (itemOnClick?: () => void) => {
    if (itemOnClick) {
      itemOnClick();
    }

    setIsOpen(false);
  };

  const filteredItems = itemsList.filter((item) => item.name !== activeItem);

  const variantClasses = {
    default: 'bg-darkOrange-11 text-darkOrange-5 border-darkOrange-9',
    gray: 'border-newGray-6 text-black font-medium bg-newGray-6',
  };

  return (
    <div
      className={cn(
        'relative w-full mx-auto lg:hidden bg-newGray-6',
        isOpen ? 'rounded-t-xl z-10' : 'rounded-xl z-10',
        maxWidth,
      )}
      ref={ref}
    >
      <div className="rounded-t-xl p-1.5">
        {filteredItems.length > 0 ? (
          <button
            type="button"
            className={cn(
              'flex items-center gap-4 px-4 pt-3 pb-2 w-full bg-newGray-5 rounded-xl',
            )}
            id="options-menu"
            aria-expanded={isOpen}
            aria-haspopup="true"
            onClick={toggleDropdown}
          >
            <span className="font-medium leading-[140%] tracking-015px text-start bg-newGray-5 text-black">
              {activeItem}
            </span>

            <MdKeyboardArrowDown
              className={cn(
                'ml-auto size-6 transition-transform ease-in-out text-black',
                isOpen ? '-rotate-180' : 'rotate-0',
              )}
            />
          </button>
        ) : (
          <button
            type="button"
            className={cn(
              'flex items-center gap-4 px-4 pt-3 pb-2 w-full',
              variantClasses[variant],
              isOpen ? ' ' : '',
            )}
            id="options-menu"
            disabled
          >
            <span className="font-medium leading-[140%] tracking-015px text-start">
              {activeItem}
            </span>
          </button>
        )}
      </div>

      {isOpen && filteredItems.length > 0 && (
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 w-full max-w-[400px] max-h-[366px] rounded-b-xl overflow-auto no-scrollbar',
            variantClasses[variant],
            ' z-10',
          )}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          {filteredItems.map((item, index) => (
            <DropdownItem
              name={item.name}
              link={item.link}
              onClick={() => handleItemClick(item.onClick)}
              key={`${item.name}_${index}`}
              variant="white"
            />
          ))}
        </div>
      )}
    </div>
  );
};
