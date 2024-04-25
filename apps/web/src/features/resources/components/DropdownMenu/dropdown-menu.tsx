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
}

export const DropdownMenu = ({ activeItem, itemsList }: DropdownMenuProps) => {
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

  return (
    <div className={'relative w-full max-w-[400px] md:hidden'} ref={ref}>
      <div>
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
          <span className="text-darkOrange-5 font-medium leading-[140%] tracking-[0.15px]">
            {activeItem}
          </span>
          <MdKeyboardArrowDown
            className={cn(
              'ml-auto text-newOrange-1 size-6 transition-transform ease-in-out',
              isOpen ? '-rotate-180' : 'rotate-0',
            )}
          />
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute left-1/2 -translate-x-1/2 w-full max-w-[400px] max-h-[366px] px-2 pb-2 rounded-b-xl bg-darkOrange-11 border-x border-b border-darkOrange-9 z-10 overflow-auto no-scrollbar"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          {itemsList
            .filter((item) => item.name !== activeItem)
            .map((item) => (
              <DropdownItem
                name={item.name}
                link={item.link}
                onClick={item.onClick}
                key={item.name}
              />
            ))}
        </div>
      )}
    </div>
  );
};
