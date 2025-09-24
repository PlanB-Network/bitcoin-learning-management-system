import { cn } from '@blms/ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { useEffect, useRef, useState } from 'react';
import { TbChevronDown } from 'react-icons/tb';
import { DropdownItem } from './dropdown-item.tsx';

const dropdownButtonVariant = cva('flex items-center gap-4 px-4 py-3 w-full', {
  defaultVariants: {
    isOpen: false,
    variant: 'dark',
  },
  variants: {
    isOpen: {
      false: 'rounded-xl border',
      true: 'rounded-t-xl border-x border-t',
    },
    variant: {
      dark: 'bg-darkOrange-11 border-darkOrange-9',
      light: 'bg-neutral-50 border-none',
    },
  },
});

const dropdownContainerVariant = cva(
  'absolute left-1/2 -translate-x-1/2 w-full max-w-[400px] max-h-[366px] px-2 pb-3 rounded-b-xl border-x border-b z-10 overflow-auto no-scrollbar',
  {
    defaultVariants: {
      variant: 'dark',
    },
    variants: {
      variant: {
        dark: 'bg-darkOrange-11 border-darkOrange-9',
        light: 'bg-neutral-50 border-none',
      },
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
  placeholder?: string;
  forcePlaceholder?: boolean;
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
  className,
  placeholder,
  forcePlaceholder = false,
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
      className={cn('relative w-full', className, isOpen && 'z-20', maxWidth)}
      ref={ref}
      {...props}
    >
      <div>
        {filteredItems.length > 0 ? (
          <button
            type="button"
            className={dropdownButtonVariant({ isOpen: isOpen, variant })}
            id="options-menu"
            aria-expanded={isOpen}
            aria-haspopup="true"
            onClick={toggleDropdown}
          >
            <span
              className={cn(
                'body-small lg:dropdown-small text-start truncate',
                variant === 'light' && forcePlaceholder
                  ? 'text-neutral-700'
                  : 'text-black',
              )}
            >
              {forcePlaceholder ? (placeholder ?? activeItem) : activeItem}
            </span>

            <TbChevronDown
              className={cn(
                'ml-auto size-6 transition-transform ease-in-out text-neutral-400 shrink-0',
                isOpen ? '-rotate-180' : 'rotate-0',
              )}
            />
          </button>
        ) : (
          <button
            type="button"
            className={dropdownButtonVariant({ isOpen: isOpen, variant })}
            id="options-menu"
            disabled
          >
            <span
              className={cn('dropdown-small text-start truncate text-black')}
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
