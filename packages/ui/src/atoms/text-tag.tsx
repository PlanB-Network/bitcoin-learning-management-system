import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils.js';

const textTagVariants = cva(
  'w-fit justify-center items-center gap-2 inline-flex',
  {
    variants: {
      size: {
        small: 'px-2 py-[3px] subtitle-medium-16px rounded-lg',
        verySmall:
          'px-[5px] py-px text-xs leading-[166%] tracking-[0.4px] rounded-[5px]',
      },
      variant: {
        withoutFill:
          'bg-transparent text-newBlack-5 dark:text-newGray-3 [&.dark100]:text-newGray-4',
        grey: 'bg-newGray-5 text-newBlack-4 dark:bg-newBlack-3 dark:text-newGray-4 [&.light100]:bg-newGray-4 [&.dark100]:bg-newBlack-5 [&.dark100]:text-newGray-5',
        orange:
          'bg-darkOrange-0 text-darkOrange-7 dark:bg-darkOrange-8 dark:text-darkOrange-2 [&.light100]:bg-darkOrange-1 [&.dark100]:bg-darkOrange-8 [&.dark100]:text-darkOrange-2',
        green:
          'bg-brightGreen-1 text-brightGreen-8 dark:bg-brightGreen-9 dark:text-brightGreen-2 [&.light100]:bg-brightGreen-2 [&.dark100]:bg-brightGreen-9 [&.dark100]:text-brightGreen-2',
        lightMaroon:
          'bg-maroon-1 text-maroon-8 dark:bg-maroon-8 dark:text-white [&.light100]:bg-maroon-2 [&.dark100]:bg-maroon-8 [&.dark100]:text-white',
        darkMaroon:
          'bg-maroon-2 text-maroon-8 dark:bg-maroon-9 dark:text-white [&.light100]:bg-maroon-3',
      },
      mode: {
        light: '',
        light100: 'light100',
        dark: 'dark',
        dark100: 'dark100',
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
    const Comp = asChild ? Slot : 'span';
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
