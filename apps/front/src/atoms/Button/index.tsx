import { ButtonHTMLAttributes, DetailedHTMLProps, useMemo } from 'react';

import { compose } from '../../utils';
import { BaseAtomProps } from '../types';

interface ButtonProps extends BaseAtomProps {
  children: string;
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  variant?: 'primary' | 'secondary' | 'soft' | 'text';
  rounded?: boolean;
  iconLeft?: JSX.Element;
  iconRight?: JSX.Element;
  buttonProps?: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >;
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
    'text-white bg-primary-700 hover:bg-primary-600 font-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
  secondary:
    'bg-white text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-primary-100',
  soft: 'bg-primary-50 text-primary-600 shadow-sm hover:bg-primary-100',
  text: '',
};

export const Button = ({
  children,
  size,
  variant,
  rounded,
  buttonProps,
  iconLeft,
  iconRight,
  className,
}: ButtonProps) => {
  const classes = useMemo(
    () => [
      classesBySize[size ?? 'm'],
      classesByVariant[variant ?? 'primary'],
      rounded ? 'rounded-full' : 'rounded-md',
    ],
    [rounded, size, variant]
  );

  return (
    <button
      className={compose(
        ...classes,
        'active:scale-95 flex flex-row items-center duration-150 transition-colors font-normal leading-normal',
        className ?? ''
      )}
      {...buttonProps}
    >
      {iconLeft && <span className="mr-3">{iconLeft}</span>}
      {children}
      {iconRight && <span className="ml-3">{iconRight}</span>}
    </button>
  );
};
