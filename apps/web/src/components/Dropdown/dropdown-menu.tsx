import { type VariantProps, cva } from 'class-variance-authority';
import { useEffect, useRef, useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { cn } from '@blms/ui';

import { DropdownItem } from './dropdown-item.tsx';

const dropdownButtonVariant = cva(
  'flex items-center gap-4 px-4 pt-3 pb-2 w-full',
  {
    variants: {
      variant: {
        light: 'bg-newGray-6 border-newGray-4',
        dark: 'bg-darkOrange-11 border-darkOrange-9',
      },
      isOpen: {
        true: 'rounded-t-xl border-x border-t',
        false: 'rounded-xl border',
      },
    },
    defaultVariants: {
      variant: 'dark',
      isOpen: false,
    },
  },
);

const dropdownContainerVariant = cva(
  'absolute left-1/2 -translate-x-1/2 w-full max-w-[400px] max-h-[366px] px-2 pb-2 rounded-b-xl border-x border-b z-10 overflow-auto no-scrollbar',
  {
    variants: {
      variant: {
        light: 'bg-newGray-6 border-newGray-4',
        dark: 'bg-darkOrange-11 border-darkOrange-9',
      },
    },
    defaultVariants: {
      variant: 'dark',
    },
  },
);

interface DropdownMenuProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dropdownButtonVariant> {
  activeItem: string;
  itemsList: ItemProps[];
  maxWidth?: string;
  variant?: 'dark' | 'light';
}

interface ItemProps {
  name: string;
  link?: string;
  onClick?: () => void;
}

export const DropdownMenu = ({
  activeItem,
  itemsList,
  maxWidth = 'max-w-[400px]',
  variant = 'dark',
  ...props
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

  return (
    <div
      className={cn('relative w-full lg:hidden', isOpen && 'z-20', maxWidth)}
      ref={ref}
      {...props}
    >
      <div>
        {filteredItems.length > 0 ? (
          <button
            type="button"
            className={dropdownButtonVariant({ variant, isOpen: isOpen })}
            id="options-menu"
            aria-expanded={isOpen}
            aria-haspopup="true"
            onClick={toggleDropdown}
          >
            <span
              className={cn(
                'font-medium leading-[140%] tracking-015px text-start truncate text-darkOrange-5',
              )}
            >
              {activeItem}
            </span>

            <MdKeyboardArrowDown
              className={cn(
                'ml-auto size-6 transition-transform ease-in-out text-darkOrange-5',
                isOpen ? '-rotate-180' : 'rotate-0',
              )}
            />
          </button>
        ) : (
          <button
            type="button"
            className={dropdownButtonVariant({ variant, isOpen: isOpen })}
            id="options-menu"
            disabled
          >
            <span
              className={cn(
                'font-medium leading-[140%] tracking-015px text-start text-darkOrange-5',
              )}
            >
              {activeItem}
            </span>
          </button>
        )}
      </div>

      {isOpen && filteredItems.length > 0 && (
        <div
          className={dropdownContainerVariant({ variant })}
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
              variant={variant}
            />
          ))}
        </div>
      )}
    </div>
  );
};
