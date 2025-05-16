import { cva } from 'class-variance-authority';
import type React from 'react';

import { cn } from '@blms/ui';

interface ListItemProps {
  leftText: string;
  rightText: string | React.ReactNode;
  isMobileOnly?: boolean;
  isDesktopOnly?: boolean;
  wrapOnMobile?: boolean;
  hasIncreasedPadding?: boolean;
  className?: string;
  rightTextClassName?: string;
  leftTextClassName?: string;
  variant?: 'dark' | 'light' | 'lightMaroon';
}

const listItemVariant = cva(
  'text-base flex items-center justify-between &:not(:last-child):border-b md:gap-2',
  {
    variants: {
      variant: {
        light: 'border-newGray-4',
        dark: 'border-white/10',
        lightMaroon: 'border-black/10',
      },
      isMobileOnly: {
        true: 'md:hidden',
        false: '',
      },
      isDesktopOnly: {
        true: 'hidden md:flex',
        false: '',
      },
      wrapOnMobile: {
        true: 'flex-col md:flex-row items-start md:items-center gap-1 md:gap-2',
        false: '',
      },
      hasIncreasedPadding: {
        true: 'py-4 px-1',
        false: 'py-3 px-1',
      },
    },
    defaultVariants: {
      variant: 'dark',
      isMobileOnly: false,
      isDesktopOnly: false,
      wrapOnMobile: false,
      hasIncreasedPadding: false,
    },
  },
);

export function ListItem({
  leftText,
  rightText,
  isMobileOnly,
  isDesktopOnly,
  wrapOnMobile,
  hasIncreasedPadding,
  className,
  rightTextClassName,
  leftTextClassName,
  variant,
}: ListItemProps) {
  return (
    <div
      className={cn(
        listItemVariant({
          variant,
          isMobileOnly,
          isDesktopOnly,
          wrapOnMobile,
          hasIncreasedPadding,
        }),
        className,
      )}
    >
      <p
        className={cn(
          'text-sm md:text-base font-medium opacity-70',
          leftTextClassName,
        )}
      >
        {leftText}
      </p>
      <p
        className={cn(
          'text-sm md:text-base font-medium',
          wrapOnMobile && 'opacity-100',
          rightTextClassName,
        )}
      >
        {rightText}
      </p>
    </div>
  );
}
