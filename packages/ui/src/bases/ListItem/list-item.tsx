import { cn } from '@blms/ui';
import { cva } from 'class-variance-authority';
import type React from 'react';

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
    defaultVariants: {
      hasIncreasedPadding: false,
      isDesktopOnly: false,
      isMobileOnly: false,
      variant: 'dark',
      wrapOnMobile: false,
    },
    variants: {
      hasIncreasedPadding: {
        false: 'py-2 md:py-[3px]',
        true: 'py-3',
      },
      isDesktopOnly: {
        false: '',
        true: 'max-md:hidden',
      },
      isMobileOnly: {
        false: '',
        true: 'md:hidden',
      },
      variant: {
        dark: 'border-white/10',
        light: 'border-newGray-4',
        lightMaroon: 'border-black/10',
      },
      wrapOnMobile: {
        false: '',
        true: 'max-md:flex-wrap',
      },
    },
  },
);

const leftTextListItemVariant = cva('leading-relaxed tracking-[0.08px]', {
  defaultVariants: {
    variant: 'dark',
  },
  variants: {
    variant: {
      dark: 'text-white/70',
      light: 'text-newBlack-4',
      lightMaroon: 'text-maroon-8',
    },
  },
});

const rightTextListItemVariant = cva(
  'font-medium leading-relaxed tracking-[0.08px] text-right',
  {
    defaultVariants: {
      variant: 'dark',
    },
    variants: {
      variant: {
        dark: 'text-white',
        light: 'text-newBlack-1',
        lightMaroon: 'text-maroon-11',
      },
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
          hasIncreasedPadding,
          isDesktopOnly,
          isMobileOnly,
          variant,
          wrapOnMobile,
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
