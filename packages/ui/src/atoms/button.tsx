import type { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';
import { useMemo } from 'react';
import '../styles/global.css';
import { FaArrowLeftLong, FaArrowRightLong } from 'react-icons/fa6';

import type { BaseAtomProps } from '../lib/types.ts';
import { cn } from '../lib/utils.js';

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
  mode?: 'light' | 'dark' | 'colored';
  rounded?: boolean;
  glowing?: boolean;
  fakeDisabled?: boolean;
  iconLeft?: JSX.Element;
  iconRight?: JSX.Element;
  icon?: JSX.Element;
  onHoverArrow?: boolean;
  onHoverArrowDirection?: 'left' | 'right';
}

const sizeClasses = {
  xs: 'px-2 py-1.5 text-xs leading-[14px] !font-medium rounded-md',
  s: 'px-2.5 py-1.5 text-base leading-[19px] !font-medium rounded-md',
  m: 'px-3.5 py-3 text-lg leading-[21px] !font-medium rounded-lg',
  l: 'px-[18px] py-[14px] text-xl leading-[24px] !font-medium rounded-2xl',
  xl: 'px-12 py-3 text-xl !font-medium rounded-2xl',
};

const variantClasses = {
  primary: {
    dark: 'text-white bg-blue-700 hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
    light: 'bg-darkOrange-5 text-white shadow-primary-button-light',
    colored: 'bg-white text-darkOrange-5 shadow-primary-button-light',
  },
  newPrimary: {
    dark: 'bg-darkOrange-5 text-white',
    light: 'bg-darkOrange-5 text-white shadow-primary-button-light',
    colored: 'bg-white text-darkOrange-5 shadow-primary-button-light',
  },
  newPrimaryGhost: {
    dark: 'bg-transparent text-darkOrange-5 border border-darkOrange-4',
    light: '',
    colored: '',
  },
  secondary: {
    dark: 'bg-white text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300',
    light: 'bg-newGray-4 text-newBlack-1 shadow-primary-button-light',
    colored: 'bg-white/30 text-white',
  },
  newSecondary: {
    dark: 'bg-white text-newBlack-1',
    light: 'bg-newGray-4 text-newBlack-1 shadow-primary-button-light',
    colored: 'bg-white/30 text-white',
  },
  tertiary: {
    dark: 'bg-orange-600 text-white',
    light:
      'bg-newGray-5 text-newGray-1 hover:text-newBlack-4 border border-newGray-3 hover:border-newGray-2 transition-colors',
    colored: '',
  },
  newTertiary: {
    dark: 'bg-newBlack-3 text-newGray-4 hover:text-white border border-newGray-1 hover:border-newGray-4 transition-colors',
    light:
      'bg-newGray-5 text-newGray-1 hover:text-newBlack-4 border border-newGray-3 hover:border-newGray-2 transition-colors',
    colored: '',
  },
  ghost: {
    dark: 'text-white border border-newGray-2 hover:border-white transition-colors',
    light: 'text-darkOrange-5 border border-darkOrange-4',
    colored: 'text-white border border-white',
  },
  download: {
    dark: 'bg-green-600 text-white',
    light: '',
    colored: '',
  },
  text: {
    dark: '',
    light: '',
    colored: '',
  },
};

const variantDisabledClasses = {
  primary: {
    dark: '',
    light: '',
    colored: '',
  },
  newPrimary: {
    dark: '!bg-darkOrange-8 !text-newGray-1',
    light: '!bg-darkOrange-1 !text-darkOrange-3',
    colored: '!bg-darkOrange-1 !text-darkOrange-3',
  },
  newPrimaryGhost: {
    dark: '',
    light: '',
    colored: '',
  },
  secondary: {
    dark: '',
    light: '',
    colored: '',
  },
  newSecondary: {
    dark: '!bg-newBlack-3 !text-newGray-1',
    light: '!bg-newGray-4 !text-newGray-2',
    colored: '!bg-white/10 !text-white/40',
  },
  tertiary: {
    dark: '',
    light: '',
    colored: '',
  },
  newTertiary: {
    dark: '!bg-newBlack-2 !text-newBlack-4 !border-newBlack-4',
    light: '!bg-newGray-5 !text-newGray-4 !border-newGray-4',
    colored: '',
  },
  ghost: {
    dark: '!text-newBlack-5 !border-newBlack-5',
    light: '!text-newGray-3 !border-newGray-3',
    colored: '!text-white/60 !border-white/50',
  },
  download: {
    dark: '',
    light: '',
    colored: '',
  },
  text: {
    dark: '',
    light: '',
    colored: '',
  },
};

const hoverArrowClasses =
  'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100';

export const Button = ({
  children,
  variant = 'primary',
  size = 'm',
  mode = 'dark',
  rounded,
  glowing,
  iconLeft,
  iconRight,
  onHoverArrow,
  onHoverArrowDirection = 'right',
  icon,
  className,
  disabled,
  fakeDisabled,
  ...buttonProps
}: ButtonProps) => {
  const classes = useMemo(
    () => [
      sizeClasses[size],
      variantClasses[variant]?.[mode],
      rounded ? '!rounded-full' : '',
      disabled ? 'cursor-default active:none' : 'active:scale-95',
      (disabled || fakeDisabled) &&
        (variantDisabledClasses[variant]?.[mode] ||
          'active:none bg-newBlack-3 !text-newGray-1'),
    ],
    [rounded, size, variant, mode, disabled, fakeDisabled],
  );

  if (icon)
    return (
      <button
        disabled={disabled}
        className={cn(
          ...classes,
          'flex flex-row items-center transition-colors duration-150',
          className,
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
        'flex flex-row items-center justify-center transition-colors duration-150',
        glowing && variant !== 'secondary' ? 'shadow-md-button' : '',
        glowing && variant === 'secondary' ? '!shadow-md-button-white' : '',
        'group',
        className,
      )}
      {...buttonProps}
    >
      {onHoverArrow && onHoverArrowDirection === 'left' && (
        <FaArrowLeftLong
          className={cn(hoverArrowClasses, 'group-hover:mr-3')}
        />
      )}
      {iconLeft && <span className="mr-3">{iconLeft}</span>}
      {children}
      {iconRight && <span className="ml-3">{iconRight}</span>}
      {onHoverArrow && onHoverArrowDirection === 'right' && (
        <FaArrowRightLong
          className={cn(hoverArrowClasses, 'group-hover:ml-3')}
        />
      )}
    </button>
  );
};
