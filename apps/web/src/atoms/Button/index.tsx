import { ButtonHTMLAttributes, DetailedHTMLProps, useMemo } from 'react';

import { compose } from '../../utils';
import { BaseAtomProps } from '../types';

interface ButtonProps
  extends BaseAtomProps,
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    > {
  children?: string | JSX.Element | JSX.Element[];
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  variant?: 'primary' | 'secondary' | 'tertiary' | 'soft' | 'text';
  rounded?: boolean;
  iconLeft?: JSX.Element;
  iconRight?: JSX.Element;
  icon?: JSX.Element;
}

const classesBySize = {
  xs: 'px-2 py-1 text-xs/5',
  s: 'px-3 py-1.5 text-sm font-semibold',
  m: 'px-5 py-2 text-base font-semibold',
  l: 'px-8 py-2.5 text-lg font-semibold',
  xl: 'px-12 py-3 text-xl font-semibold',
};

const classesByVariant = {
  primary:
    'text-white bg-blue-700 hover:bg-blue-600 font-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
  tertiary: 'bg-orange-600 text-white font-normal',
  secondary:
    'bg-white text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-blue-100',
  soft: 'bg-blue-50 text-blue-600 shadow-sm hover:bg-blue-100',
  text: '',
};

export const Button = ({
  children,
  size,
  variant,
  rounded,
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
      rounded ? 'rounded-full' : 'rounded-md',
    ],
    [rounded, size, variant]
  );

  const disabledClass = disabled
    ? '  active:none bg-gray-300 text-white font-normal cursor-default'
    : '';

  if (icon)
    return (
      <button
        disabled={disabled}
        className={compose(
          ...classes,
          disabled ? 'active:none' : 'active:scale-95',
          'flex flex-row items-center duration-150 transition-colors font-normal leading-normal',
          className ?? '',
          disabledClass
        )}
        {...buttonProps}
      >
        {icon}
      </button>
    );

  return (
    <button
      disabled={disabled}
      className={compose(
        ...classes,
        disabled ? 'active:none' : 'active:scale-95',
        'flex flex-row items-center duration-150 transition-colors font-normal leading-normal justify-center',
        className ?? '',
        disabledClass
      )}
      {...buttonProps}
    >
      {iconLeft && <span className="mr-3">{iconLeft}</span>}
      {children}
      {iconRight && <span className="ml-3">{iconRight}</span>}
    </button>
  );
};
