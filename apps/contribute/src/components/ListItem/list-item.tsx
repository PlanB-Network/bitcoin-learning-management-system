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
        true: 'max-md:hidden',
        false: '',
      },
      wrapOnMobile: {
        true: 'max-md:flex-wrap',
        false: '',
      },
      hasIncreasedPadding: {
        true: 'py-3',
        false: 'py-2 md:py-[3px]',
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

const leftTextListItemVariant = cva('leading-relaxed tracking-[0.08px]', {
  variants: {
    variant: {
      light: 'text-newBlack-4',
      dark: 'text-white/70',
      lightMaroon: 'text-maroon-8',
    },
  },
  defaultVariants: {
    variant: 'dark',
  },
});

const rightTextListItemVariant = cva(
  'font-medium leading-relaxed tracking-[0.08px] text-right',
  {
    variants: {
      variant: {
        light: 'text-newBlack-1',
        dark: 'text-white',
        lightMaroon: 'text-maroon-11',
      },
    },
    defaultVariants: {
      variant: 'dark',
    },
  },
);

export const ListItem = ({
  leftText,
  rightText,
  isMobileOnly,
  isDesktopOnly,
  wrapOnMobile,
  hasIncreasedPadding,
  className,
  rightTextClassName,
  leftTextClassName,
  variant = 'dark',
}: ListItemProps) => {
  return (
    <div
      className={cn(
        listItemVariant({
          isMobileOnly,
          isDesktopOnly,
          wrapOnMobile,
          hasIncreasedPadding,
          variant,
        }),
        className,
      )}
    >
      <span
        className={cn(leftTextListItemVariant({ variant }), leftTextClassName)}
      >
        {leftText}
      </span>
      <span
        className={cn(
          rightTextListItemVariant({ variant }),
          rightTextClassName,
        )}
      >
        {rightText}
      </span>
    </div>
  );
};
