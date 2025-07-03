import { Link } from '@tanstack/react-router';
import { cva, type VariantProps } from 'class-variance-authority';

const dropdownItemVariant = cva(
  'flex items-center gap-4 p-2 leading-[140%] tracking-015px text-start rounded',
  {
    defaultVariants: {
      variant: 'dark',
    },
    variants: {
      variant: {
        dark: 'text-white hover:bg-white/15',
        light: 'text-black hover:bg-newGray-5',
      },
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
