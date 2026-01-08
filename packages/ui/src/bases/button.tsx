import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils.js';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden disabled:pointer-events-none w-fit',
  {
    defaultVariants: {
      size: 'm',
      variant: 'primary',
    },
    variants: {
      size: {
        carouselSize: 'p-0 text-base md:text-xl rounded-full',
        flagsMobile: 'px-2.5 py-3 font-base font-medium rounded-[8px]',
        actionButton: 'px-3 py-2 !body-base-bold rounded-full',
        l: 'px-4 py-3 text-xl leading-6 !font-medium rounded-2xl',
        loginButton: 'py-2.5 px-2 text-xs leading-3 !font-medium rounded-lg',
        m: 'px-3.5 py-3 text-lg leading-5 !font-medium rounded-[10px]',
        s: 'px-2.5 py-1.5 text-base leading-5 !font-medium rounded-lg',
        xl: 'px-12 py-3 text-xl !font-medium rounded-2xl',
        xs: 'px-2 py-1.5 text-xs leading-3 !font-medium rounded-lg',
      },
      variant: {
        carousel:
          'bg-primary text-black disabled:text-neutral-500 disabled:bg-orange-800 hover:bg-orange-300 opacity-100',
        carouselDashboard: 'bg-orange-500 text-white opacity-60',
        fakeDisabled: '!bg-orange-100 !text-orange-300',
        flags: 'bg-[#ffffff4d] text-white !rounded-[16px]',
        ghost: 'text-text disabled:opacity-30',
        loginButton: 'bg-neutral-800 text-white hover:bg-[#5c5c5c]',
        outline:
          'bg-transparent text-primary border border-primary disabled:!text-neutral-300 disabled:!border-neutral-300',
        outlineWhite:
          'text-white border border-neutral-400 hover:border-white transition-colors disabled:!text-neutral-600 disabled:!border-neutral-600',
        primary:
          'bg-primary text-white disabled:!bg-orange-100 disabled:!text-orange-300',
        secondary: 'bg-orange-50 text-orange-500',
        tertiary:
          'bg-neutral-50 text-black border-neutral-300 disabled:!bg-neutral-100 disabled:!text-neutral-200 disabled:border-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-500 dark:disabled:bg-neutral-900 dark:disabled:text-neutral-700 dark:disabled:border-neutral-700',
        newTertiary:
          'bg-neutral-50 text-black hover:bg-neutral-100 focus-visible:border-5 focus-visible:border-neutral-100 disabled:opacity-30',
        transparent: 'bg-white/30 text-white',
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      mode = 'light',
      rounded,
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
