import { Link } from '@tanstack/react-router';

import { cn } from '@blms/ui';

interface DropdownItemProps {
  name: string;
  link?: string;
  onClick?: () => void;
  variant?: 'dark' | 'light';
}

export const DropdownItem = ({
  name,
  link,
  onClick,
  variant = 'dark',
}: DropdownItemProps) => {
  return link ? (
    <Link
      to={link}
      className={cn(
        'flex items-center gap-4 p-2 ',
        variant === 'light' ? 'hover:bg-newGray-5' : 'hover:bg-white/15',
      )}
    >
      <span
        className={cn(
          'leading-[140%] tracking-015px',
          variant === 'light' ? 'text-black' : 'text-white',
        )}
      >
        {name}
      </span>
    </Link>
  ) : (
    <button
      className={cn(
        'text-left p-2 leading-[140%] tracking-015px rounded-2xl w-full',
        variant === 'light'
          ? 'text-black hover:bg-newGray-5'
          : 'text-white hover:bg-white/15',
      )}
      onClick={onClick}
    >
      {name}
    </button>
  );
};
