import { cn } from '@blms/ui';
import { cva } from 'class-variance-authority';
import type React from 'react';

interface ListItemProps {
  icon?: React.ReactNode;
  leftText: string;
  rightText: string | React.ReactNode;
  isMobileOnly?: boolean;
  isDesktopOnly?: boolean;
  wrapOnMobile?: boolean;
  hasIncreasedPadding?: boolean;
  className?: string;
  rightTextClassName?: string;
  leftTextClassName?: string;
  variant?: 'dark' | 'light' | 'lightMaroon' | 'grey';
}

const listItemVariant = cva(
  'text-base flex items-center justify-between border-b last:border-b-0 md:gap-2',
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
        false: 'py-2 md:py-1',
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
        light: 'border-black/10',
        lightMaroon: 'border-black/10',
        grey: 'border-newGray-6',
      },
      wrapOnMobile: {
        false: '',
        true: 'max-md:flex-wrap',
      },
    },
  },
);

const leftTextListItemVariant = cva(
  'flex items-center gap-2 leading-relaxed tracking-[0.08px]',
  {
    defaultVariants: {
      variant: 'dark',
    },
    variants: {
      variant: {
        dark: 'text-white/70',
        light: 'text-neutral-400',
        lightMaroon: 'text-maroon-8',
        grey: 'text-newGray-1',
      },
    },
  },
);

const rightTextListItemVariant = cva(
  'font-medium leading-relaxed tracking-[0.08px]',
  {
    defaultVariants: {
      variant: 'dark',
    },
    variants: {
      variant: {
        dark: 'text-white',
        light: 'text-black',
        lightMaroon: 'text-maroon-11',
        grey: 'text-newBlack-3',
      },
    },
  },
);

export const ListItem = ({
  icon,
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
        {icon}
        {leftText}
      </span>
      <span
        className={cn(
          rightTextListItemVariant({ variant }),
          rightTextClassName,
          wrapOnMobile ? 'max-md:w-full md:text-right' : 'text-right',
        )}
      >
        {rightText}
      </span>
    </div>
  );
};
