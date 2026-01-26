import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils.js';

const textTagVariants = cva(
  'w-fit justify-center items-center gap-2 inline-flex',
  {
    defaultVariants: {
      mode: 'light',
      size: 'base',
      variant: 'grey',
    },
    variants: {
      mode: {
        dark: 'dark',
        dark100: 'dark100',
        light: '',
        light100: 'light100',
      },
      size: {
        base: 'px-3 py-2 body-small-bold rounded-full',
        small: 'px-2 py-1 body-extra-small-bold rounded-full',
      },
      variant: {
        brown: 'bg-white text-brown-800',
        darkMaroon:
          'bg-brown-200 text-brown-700 dark:bg-brown-800 dark:text-white [&.light100]:bg-brown-300',
        green:
          'bg-green-50 text-green-700 dark:bg-green-800 dark:text-green-100 [&.light100]:bg-green-100 [&.dark100]:bg-green-800 [&.dark100]:text-green-100',
        grey: 'bg-neutral-50 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 [&.light100]:bg-brown-200 [&.dark100]:bg-neutral-600 [&.dark100]:text-neutral-100',
        lightMaroon:
          'bg-brown-50 text-brown-700 dark:bg-brown-700 dark:text-white [&.light100]:bg-brown-200 [&.dark100]:bg-brown-700 [&.dark100]:text-white',
        orange:
          'bg-orange-50 text-orange-700 dark:bg-orange-800 dark:text-orange-200 [&.light100]:bg-orange-100 [&.dark100]:bg-orange-800 [&.dark100]:text-orange-200',
        yellow: 'bg-yellow-100 text-yellow-700',
        blue: 'bg-blue-100 text-blue-800',
        withoutFill:
          'bg-transparent text-neutral-600 dark:text-neutral-300 [&.dark100]:text-neutral-200',
      },
    },
  },
);
export interface TextTagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof textTagVariants> {
  asChild?: boolean;
}

const TextTag = React.forwardRef<HTMLDivElement, TextTagProps>(
  (
    { className, size, variant, mode, asChild = false, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'span';
    return (
      <Comp
        className={cn(className, textTagVariants({ mode, size, variant }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
TextTag.displayName = 'TextTag';

export { TextTag, textTagVariants };
