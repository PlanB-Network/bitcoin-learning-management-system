import { useEffect, useRef, useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { cn } from '@sovereign-university/ui';

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
}

export const DropdownMenu = ({
  activeItem,
  itemsList,
  maxWidth = 'max-w-[400px]',
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDropdown = () => setIsOpen(!isOpen);
  const ref = useRef<HTMLDivElement>(null);

  // Close the dropdown if the click is outside of it
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

  return (
    <div
      className={cn('relative w-full md:hidden', isOpen && 'z-20', maxWidth)}
      ref={ref}
    >
      <div>
        {filteredItems.length > 0 ? (
          <button
            type="button"
            className={cn(
              'flex items-center gap-4 px-4 pt-3 pb-2 w-full bg-darkOrange-11',
              isOpen
                ? 'rounded-t-xl border-x border-t border-darkOrange-9'
                : 'rounded-xl border border-darkOrange-9',
            )}
            id="options-menu"
            aria-expanded={isOpen}
            aria-haspopup="true"
            onClick={toggleDropdown}
          >
            <span className="text-darkOrange-5 font-medium leading-[140%] tracking-015px text-start">
              {activeItem}
            </span>

            <MdKeyboardArrowDown
              className={cn(
                'ml-auto text-newOrange-1 size-6 transition-transform ease-in-out',
                isOpen ? '-rotate-180' : 'rotate-0',
              )}
            />
          </button>
        ) : (
          <button
            type="button"
            className={cn(
              'flex items-center gap-4 px-4 pt-3 pb-2 w-full bg-darkOrange-11',
              isOpen
                ? 'rounded-t-xl border-x border-t border-darkOrange-9'
                : 'rounded-xl border border-darkOrange-9',
            )}
            id="options-menu"
            disabled
          >
            <span className="text-darkOrange-5 font-medium leading-[140%] tracking-015px text-start">
              {activeItem}
            </span>
          </button>
        )}
      </div>

      {isOpen && filteredItems.length > 0 && (
        <div
          className="absolute left-1/2 -translate-x-1/2 w-full max-w-[400px] max-h-[366px] px-2 pb-2 rounded-b-xl bg-darkOrange-11 border-x border-b border-darkOrange-9 z-10 overflow-auto no-scrollbar"
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
            />
          ))}
        </div>
      )}
    </div>
  );
};
