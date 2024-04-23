import type { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';
import { useMemo } from 'react';
import '../../styles/global.css';

import { cn } from '../../lib/utils.ts';
import type { BaseAtomProps } from '../types.ts';

export interface ButtonProps
  extends BaseAtomProps,
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    > {
  children?: string | JSX.Element | JSX.Element[];
  variant?:
    | 'primary'
    | 'newPrimary'
    | 'newPrimaryGhost'
    | 'secondary'
    | 'newSecondary'
    | 'tertiary'
    | 'newTertiary'
    | 'ghost'
    | 'download'
    | 'text';
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  rounded?: boolean;
  glowing?: boolean;
  iconLeft?: JSX.Element;
  iconRight?: JSX.Element;
  icon?: JSX.Element;
}

const classesBySize = {
  xs: 'px-2 py-1 text-xs/5 !font-normal',
  s: 'px-3 py-1.5 text-sm',
  m: 'px-4 py-1 text-xs md:px-5 md:py-2 md:text-base',
  l: 'px-8 py-2.5 text-lg',
  xl: 'px-12 py-3 text-xl',
};

const classesByVariant = {
  primary:
    'text-white bg-blue-700 hover:bg-blue-600 font-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
  newPrimary: 'bg-newOrange-1 text-white',
  newPrimary: 'bg-newOrange-1 text-white',
  newPrimaryGhost:
    'bg-transparent text-darkOrange-5 border border-darkOrange-4',
  secondary: 'bg-white text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300',
  newSecondary: 'bg-white text-newBlack-1',
  tertiary: 'bg-orange-600 text-white',
  newTertiary:
    'bg-newBlack-3 text-newGray-4 border border-newGray-1 hover:border-newGray-4 transition-colors',
  ghost:
    'bg-newBlack-1 text-white border border-newGray-2 hover:border-white transition-colors',
  download: 'bg-green-600 text-white',
  text: '',
};

export const Button = ({
  children,
  variant,
  size,
  rounded,
  glowing,
  iconLeft,
  iconRight,
  icon,
  className,
  disabled,
  ...buttonProps
}: ButtonProps) => {
  const classes = useMemo(
    () => [
      classesBySize[size ?? 'm'],
      classesByVariant[variant ?? 'primary'],
      rounded ? 'rounded-full' : 'rounded-lg',
      '!font-medium',
    ],
    [rounded, size, variant],
  );

  let disabledClass = '';
  if (disabled) {
    if (variant === 'newPrimary') {
      disabledClass =
        'active:none bg-newGray-5 !text-newOrange-3 font-normal cursor-default';
    } else if (variant === 'newSecondary') {
      disabledClass =
        'active:none bg-newGray-5 !text-newGray-3 font-normal cursor-default';
    } else {
      disabledClass =
        'active:none bg-newBlack-3 !text-newGray-1 font-normal cursor-default ';
    }
  }

  if (icon)
    return (
      <button
        disabled={disabled}
        className={cn(
          ...classes,
          disabled ? 'active:none' : 'active:scale-95',
          'flex flex-row items-center font-normal leading-normal transition-colors duration-150',
          className ?? '',
          disabledClass,
        )}
        {...buttonProps}
      >
        {icon}
      </button>
    );

  return (
    <button
      disabled={disabled}
      className={cn(
        ...classes,
        disabled ? 'active:none' : 'active:scale-95',
        'flex flex-row items-center justify-center font-normal leading-normal transition-colors duration-150',
        glowing && variant !== 'secondary' ? 'shadow-md-button' : '',
        glowing && variant === 'secondary' ? '!shadow-md-button-white' : '',
        className ?? '',
        disabledClass,
      )}
      {...buttonProps}
    >
      {iconLeft && <span className="mr-3">{iconLeft}</span>}
      {children}
      {iconRight && <span className="ml-3">{iconRight}</span>}
    </button>
  );
};
