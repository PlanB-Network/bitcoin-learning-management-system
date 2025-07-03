import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils.js';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none w-fit',
  {
    defaultVariants: {
      size: 'm',
      variant: 'primary',
    },
    variants: {
      size: {
        carouselSize: 'p-0 text-base md:text-xl rounded-full',
        flagsMobile: 'px-2.5 py-[14px] font-base font-medium rounded-[8px]',
        l: 'px-[18px] py-[14px] text-xl leading-[24px] !font-medium rounded-2xl',
        loginButton: 'py-[14px] px-[18px] subtitle-medium-16px rounded-[16px]',
        m: 'px-3.5 py-3 text-lg leading-[21px] !font-medium rounded-[10px]',
        s: 'px-2.5 py-1.5 text-base leading-[19px] !font-medium rounded-lg',
        xl: 'px-12 py-3 text-xl !font-medium rounded-2xl',
        xs: 'px-2 py-1.5 text-xs leading-[14px] !font-medium rounded-lg',
      },
      variant: {
        carousel:
          'bg-primary text-black disabled:text-newGray-1 disabled:bg-darkOrange-8 hover:bg-darkOrange-3 opacity-100',
        carouselDashboard: 'bg-darkOrange-5 text-white opacity-60',
        fakeDisabled: '!bg-darkOrange-1 !text-darkOrange-3',
        flags: 'bg-[#ffffff4d] text-white !rounded-[16px]',
        ghost:
          'text-text disabled:!text-newBlack-5 disabled:!border-newBlack-5',
        loginButton: 'bg-newBlack-3 text-white hover:bg-[#5c5c5c]',
        outline:
          'bg-transparent text-primary border border-primary disabled:!text-newGray-3 disabled:!border-newGray-3',
        outlineWhite:
          'text-white border border-newGray-2 hover:border-white transition-colors disabled:!text-newBlack-5 disabled:!border-newBlack-5',
        primary:
          'bg-primary text-white shadow-button disabled:!bg-darkOrange-1 disabled:!text-darkOrange-3',
        secondary:
          'bg-newGray-4 dark:bg-white text-newBlack-1 shadow-button dark:disabled:bg-newBlack-3 disabled:!text-newGray-2 dark:disabled:text-newGray-1',
        tertiary:
          'shadow-button border bg-newGray-5 text-newGray-1 border-newGray-3 disabled:!bg-newGray-5 disabled:!text-newGray-4 disabled:border-newGray-4 dark:bg-newBlack-3 dark:text-newGray-4 dark:border-newGray-1 dark:disabled:bg-newBlack-2 dark:disabled:text-newBlack-4 dark:disabled:border-newBlack-4',
        transparent: 'bg-white/30 text-white shadow-button',
      },
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  mode?: 'light' | 'dark';
  rounded?: boolean;
  glowing?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      mode = 'dark',
      rounded,
      glowing,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const classes = React.useMemo(
      () => [
        mode === 'dark' && 'dark',
        rounded ? '!rounded-full' : '',
        disabled ? 'cursor-default active:none' : 'active:scale-95',
      ],
      [rounded, mode, disabled],
    );

    return (
      <Comp
        className={cn(
          buttonVariants({ className, size, variant }),
          ...classes,
          'flex flex-row items-center justify-center transition-colors duration-150 text-wrap',
          glowing ? 'shadow-md-button' : '',
          'group/arrow',
        )}
        ref={ref}
        {...props}
        disabled={disabled}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
