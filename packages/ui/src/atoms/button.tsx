import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils.js';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white shadow-button disabled:!bg-darkOrange-1 disabled:!text-darkOrange-3',
        secondary:
          'bg-secondary text-newBlack-1 shadow-button disabled:!bg-newGray-4 disabled:!text-newGray-2',
        outline:
          'bg-transparent text-primary border border-primary disabled:!text-newGray-3 disabled:!border-newGray-3',
        outlineWhite:
          'text-white border border-newGray-2 hover:border-white transition-colors disabled:!text-newBlack-5 disabled:!border-newBlack-5',
        ghost:
          'text-text disabled:!text-newBlack-5 disabled:!border-newBlack-5',
        transparent: 'bg-white/30 text-white shadow-button',
        fakeDisabled: '!bg-darkOrange-1 !text-darkOrange-3',
        flags: 'bg-[#ffffff4d] text-white !rounded-[16px]',
      },
      size: {
        xs: 'px-2 py-1 text-xs leading-[14px] !font-medium rounded-lg',
        s: 'px-2.5 py-1.5 text-base leading-[19px] !font-medium rounded-lg',
        m: 'px-3.5 py-3 text-lg leading-[21px] !font-medium rounded-lg',
        l: 'px-[18px] py-[14px] text-xl leading-[24px] !font-medium rounded-2xl',
        xl: 'px-12 py-3 text-xl !font-medium rounded-2xl',
        flagsMobile: 'px-2.5 py-[14px] font-base font-medium rounded-[8px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'm',
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
          buttonVariants({ variant, size, className }),
          ...classes,
          'flex flex-row items-center justify-center transition-colors duration-150',
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
