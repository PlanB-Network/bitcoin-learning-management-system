'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { LuCheck } from 'react-icons/lu';

import { cn } from '#src/lib/utils.ts';

const checkboxVariants = cva(
  'peer shrink-0 border ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:text-primary-foreground',
  {
    variants: {
      variant: {
        default:
          'border-newGray-1 data-[state=checked]:bg-darkOrange-5 data-[state=checked]:border-darkOrange-5 data-[state=checked]:text-white',
      },
      size: {
        s: 'size-2.5 rounded-[2px]',
        m: 'size-4 rounded-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'm',
    },
  },
);

const checkVariant = cva('', {
  variants: {
    size: {
      s: 'size-2.5 rounded-[2px]',
      m: 'size-4 rounded-xs',
    },
  },
  defaultVariants: {
    size: 'm',
  },
});

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  variant?: 'default';
  size?: 's' | 'm';
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant = 'default', size = 'm', ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(className, checkboxVariants({ variant, size }))}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-current')}
    >
      <LuCheck className={cn(checkVariant({ size }))} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
