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
        darkMaroon:
          'bg-maroon-2 text-maroon-8 dark:bg-maroon-9 dark:text-white [&.light100]:bg-maroon-3',
        green:
          'bg-green-50 text-green-700 dark:bg-green-800 dark:text-green-100 [&.light100]:bg-green-100 [&.dark100]:bg-green-800 [&.dark100]:text-green-100',
        grey: 'bg-neutral-50 text-neutral-800 dark:bg-newBlack-3 dark:text-newGray-4 [&.light100]:bg-newGray-4 [&.dark100]:bg-newBlack-5 [&.dark100]:text-newGray-5',
        lightMaroon:
          'bg-maroon-1 text-maroon-8 dark:bg-maroon-8 dark:text-white [&.light100]:bg-maroon-2 [&.dark100]:bg-maroon-8 [&.dark100]:text-white',
        orange:
          'bg-darkOrange-0 text-darkOrange-7 dark:bg-darkOrange-8 dark:text-darkOrange-2 [&.light100]:bg-darkOrange-1 [&.dark100]:bg-darkOrange-8 [&.dark100]:text-darkOrange-2',
        yellow: 'bg-yellow-100 text-yellow-8',
        withoutFill:
          'bg-transparent text-newBlack-5 dark:text-newGray-3 [&.dark100]:text-newGray-4',
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
