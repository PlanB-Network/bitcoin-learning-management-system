import { Link } from '@tanstack/react-router';
import { type VariantProps, cva } from 'class-variance-authority';

const dropdownItemVariant = cva(
  'flex items-center gap-4 p-2 leading-[140%] tracking-015px',
  {
    variants: {
      variant: {
        light: 'text-black hover:bg-newGray-5',
        dark: 'text-white hover:bg-white/15',
      },
    },
    defaultVariants: {
      variant: 'dark',
    },
  },
);

interface DropdownItemProps extends VariantProps<typeof dropdownItemVariant> {
  name: string;
  link?: string;
  onClick?: () => void;
}

export const DropdownItem = ({
  name,
  link,
  onClick,
  variant = 'dark',
  ...props
}: DropdownItemProps) => {
  return link ? (
    <Link to={link} className={dropdownItemVariant({ variant })} {...props}>
      <span>{name}</span>
    </Link>
  ) : (
    <button
      className={dropdownItemVariant({ variant })}
      onClick={onClick}
      {...props}
    >
      {name}
    </button>
  );
};
