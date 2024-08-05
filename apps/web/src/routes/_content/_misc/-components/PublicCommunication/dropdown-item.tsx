import { Link } from '@tanstack/react-router';

import { cn } from '@blms/ui';

interface DropdownItemProps {
  name: string;
  link?: string;
  onClick?: () => void;
  variant?: 'default' | 'white';
}

export const DropdownItem = ({
  name,
  link,
  onClick,
  variant = 'default',
}: DropdownItemProps) => {
  const variantClasses = {
    default: 'text-white hover:bg-white/15',
    white: 'text-black bg-newGray-6',
  };

  return link ? (
    <Link
      to={link}
      className={cn(
        'flex items-center gap-4 p-2 rounded-2xl',
        variantClasses[variant],
      )}
    >
      <span className="leading-[140%] tracking-015px">{name}</span>
    </Link>
  ) : (
    <button
      className={cn(
        ' text-left px-2.5 py-2 leading-[140%] tracking-015px w-full',
        variantClasses[variant],
      )}
      onClick={onClick}
    >
      {name}
    </button>
  );
};
