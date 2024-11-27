import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils.js';

const textTagVariants = cva(
  'shadow-course-navigation-sm justify-center items-center gap-2 inline-flex',
  {
    variants: {
      size: {
        small: 'px-2 py-[3px] subtitle-medium-16px rounded-md',
        verySmall:
          'px-[5px] py-px text-xs leading-[166%] tracking-[0.4px] rounded-[5px]',
      },
      variant: {
        withoutFill: 'bg-transparent text-newBlack-5 dark:text-newGray-3',
        grey: 'bg-newGray-5 text-newBlack-4 dark:bg-newBlack-3 dark:text-newGray-4',
        orange:
          'bg-darkOrange-0 text-darkOrange-6 dark:bg-darkOrange-8 dark:text-darkOrange-2',
        green:
          'bg-brightGreen-1 text-brightGreen-6 dark:bg-brightGreen-9 dark:text-brightGreen-2',
        lightMaroon:
          'bg-tertiary-1 text-tertiary-7 dark:bg-tertiary-8 dark:text-white',
        darkMaroon:
          'bg-tertiary-2 text-tertiary-8 dark:bg-tertiary-9 dark:text-white',
      },
      mode: {
        light: '',
        dark: 'dark',
      },
    },
    defaultVariants: {
      size: 'small',
      variant: 'grey',
      mode: 'light',
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
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        className={cn(className, textTagVariants({ size, variant, mode }))}
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
