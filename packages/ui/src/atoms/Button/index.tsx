import type { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';
import { useMemo } from 'react';
import '../../styles/global.css';
import { FaArrowRightLong } from 'react-icons/fa6';

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
  fakeDisabled?: boolean;
  iconLeft?: JSX.Element;
  iconRight?: JSX.Element;
  icon?: JSX.Element;
  onHoverArrow?: boolean;
}

const classesBySize = {
  xs: 'px-2 py-1.5 text-xs leading-[14px] !font-medium rounded-md',
  s: 'px-2.5 py-1.5 text-base leading-[19px] !font-medium rounded-md',
  m: 'px-3.5 py-3 text-lg leading-[21px] !font-medium rounded-lg',
  l: 'px-[18px] py-[14px] text-xl leading-[24px] !font-medium rounded-2xl',
  xl: 'px-12 py-3 text-xl !font-medium rounded-2xl',
};

const classesByVariant = {
  primary:
    'text-white bg-blue-700 hover:bg-blue-600 font-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
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
  onHoverArrow,
  icon,
  className,
  disabled,
  fakeDisabled,
  ...buttonProps
}: ButtonProps) => {
  const classes = useMemo(
    () => [
      classesBySize[size ?? 'm'],
      classesByVariant[variant ?? 'primary'],
      rounded ? '!rounded-full' : '',
    ],
    [rounded, size, variant],
  );

  const hoverArrowClasses =
    'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-20 group-hover:opacity-100 group-hover:ml-3';

  let disabledClass = disabled ? 'cursor-default ' : '';
  if (disabled || fakeDisabled) {
    switch (variant) {
      case 'newPrimary': {
        disabledClass +=
          'active:none bg-darkOrange-8 !text-newGray-1 font-normal';

        break;
      }
      case 'newSecondary': {
        disabledClass +=
          'active:none bg-newBlack-3 !text-newGray-1 font-normal';

        break;
      }
      case 'newTertiary': {
        disabledClass +=
          'active:none bg-newBlack-2 !text-newBlack-4 border-newBlack-4 font-normal';

        break;
      }
      case 'ghost': {
        disabledClass +=
          'active:none bg-newBlack-1 !text-newBlack-5 border-newBlack-5 font-normal ';

        break;
      }
      default: {
        disabledClass +=
          'active:none bg-newBlack-3 !text-newGray-1 font-normal ';
      }
    }
  }

  if (icon)
    return (
      <button
        disabled={disabled}
        className={cn(
          ...classes,
          disabled ? 'active:none' : 'active:scale-95',
          'flex flex-row items-center font-normal transition-colors duration-150',
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
        'flex flex-row items-center justify-center font-normal transition-colors duration-150',
        glowing && variant !== 'secondary' ? 'shadow-md-button' : '',
        glowing && variant === 'secondary' ? '!shadow-md-button-white' : '',
        'group',
        className ?? '',
        disabledClass,
      )}
      {...buttonProps}
    >
      {iconLeft && <span className="mr-3">{iconLeft}</span>}
      {children}
      {iconRight && <span className="ml-3">{iconRight}</span>}
      {onHoverArrow && <FaArrowRightLong className={hoverArrowClasses} />}
    </button>
  );
};
