import type { AnchorHTMLAttributes, DetailedHTMLProps } from 'react';
import { useMemo } from 'react';

import { compose } from '../../utils/index.ts';
import type { BaseAtomProps } from '../types.ts';

interface AnchorProps
  extends BaseAtomProps,
    DetailedHTMLProps<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    > {
  children?: string | JSX.Element | JSX.Element[];
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  variant?: 'primary' | 'secondary' | 'tertiary' | 'download' | 'text';
  rounded?: boolean;
  glowing?: boolean;
  iconLeft?: JSX.Element;
  iconRight?: JSX.Element;
  icon?: JSX.Element;
}

const classesBySize = {
  xs: 'px-2 py-1 text-xs/5',
  s: 'px-3 py-1.5 text-sm font-semibold',
  m: 'px-4 py-1 text-xs md:px-5 md:py-2 md:text-base !font-medium md:font-semibold',
  l: 'px-8 py-2.5 text-lg font-semibold',
  xl: 'px-12 py-3 text-xl font-semibold',
};

const classesByVariant = {
  primary:
    'text-white bg-blue-700 hover:bg-blue-600 font-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
  tertiary: 'bg-orange-600 text-white font-normal',
  secondary: 'bg-white text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300',
  download: 'bg-green-600 text-white font-normal',
  text: '',
};

export const Anchor = ({
  children,
  size,
  variant,
  rounded,
  glowing,
  iconLeft,
  iconRight,
  icon,
  className,
  ...anchorProps
}: AnchorProps) => {
  const classes = useMemo(
    () => [
      classesBySize[size ?? 'm'],
      classesByVariant[variant ?? 'primary'],
      rounded ? 'rounded-full' : 'rounded-2xl',
    ],
    [rounded, size, variant],
  );

  if (icon)
    return (
      <a
        className={compose(
          ...classes,
          'active:scale-95',
          'flex flex-row items-center font-normal leading-normal transition-colors duration-150',
          className ?? '',
        )}
        {...anchorProps}
      >
        {icon}
      </a>
    );

  return (
    <a
      className={compose(
        ...classes,
        'active:scale-95',
        'flex flex-row items-center justify-center font-normal leading-normal transition-colors duration-150',
        glowing && variant !== 'secondary' ? 'shadow-md-button' : '',
        glowing && variant === 'secondary' ? '!shadow-md-button-white' : '',
        className ?? '',
      )}
      {...anchorProps}
    >
      {iconLeft && <span className="mr-3">{iconLeft}</span>}
      {children}
      {iconRight && <span className="ml-3">{iconRight}</span>}
    </a>
  );
};
