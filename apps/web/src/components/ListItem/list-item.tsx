import { cva } from 'class-variance-authority';
import type React from 'react';

import { cn } from '@blms/ui';

interface ListItemProps {
  leftText: string;
  rightText: string | React.ReactNode;
  isMobileOnly?: boolean;
  isDesktopOnly?: boolean;
  wrapOnMobile?: boolean;
  className?: string;
  variant?: 'dark' | 'light';
}

const listItemVariant = cva(
  'text-base flex items-center justify-between border-b py-2 md:py-[3px] gap-2',
  {
    variants: {
      variant: {
        light: 'border-newGray-4',
        dark: 'border-white/10',
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
    },
    defaultVariants: {
      variant: 'dark',
      isMobileOnly: false,
      isDesktopOnly: false,
      wrapOnMobile: false,
    },
  },
);

const leftTextListItemVariant = cva('leading-relaxed tracking-[0.08px]', {
  variants: {
    variant: {
      light: 'text-newBlack-4',
      dark: 'text-white/70',
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
  className,
  variant = 'dark',
}: ListItemProps) => {
  return (
    <div
      className={cn(
        listItemVariant({
          isMobileOnly,
          isDesktopOnly,
          wrapOnMobile,
          variant,
        }),
        className,
      )}
    >
      <span className={leftTextListItemVariant({ variant })}>{leftText}</span>
      <span className={rightTextListItemVariant({ variant })}>{rightText}</span>
    </div>
  );
};
