'use client';

import * as SwitchPrimitives from '@radix-ui/react-switch';
import * as React from 'react';

import { cva } from 'class-variance-authority';
import { cn } from '#src/lib/utils.ts';

const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border border- border-darkOrange-5 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-newGray-6 dark:data-[state=checked]:border-black data-[state=checked]:bg-darkOrange-5 dark:data-[state=checked]:bg-primary data-[state=unchecked]:bg-newGray-6 dark:data-[state=unchecked]:bg-black',
  {
    variants: {
      size: {
        xs: 'h-4 w-7',
        s: 'h-5 w-9',
      },
    },
    defaultVariants: {
      size: 's',
    },
  },
);

const thumbVariants = cva(
  'pointer-events-none block rounded-full bg-darkOrange-5 shadow-lg ring-0 transition-transform data-[state=checked]:bg-newGray-6 dark:data-[state=checked]:bg-black',
  {
    variants: {
      size: {
        xs: 'size-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0.5',
        s: 'size-3 data-[state=checked]:translate-x-[19px] data-[state=unchecked]:translate-x-0.5',
      },
    },
    defaultVariants: {
      size: 's',
    },
  },
);

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    mode?: 'light' | 'dark';
    size?: 'xs' | 's';
  }
>(({ className, mode = 'dark', size = 's', ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      switchVariants({ size }),
      mode === 'dark' && 'dark',
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(thumbVariants({ size }), mode === 'dark' && 'dark')}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
