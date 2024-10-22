import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils.js';

const textTagVariants = cva(
  'shadow-course-navigation-sm justify-center items-center gap-2 inline-flex',
  {
    variants: {
      size: {
        large: 'p-2 text-base font-medium leading-none rounded-md',
        small:
          'px-2 py-[3px] text-sm leading-[143%] tracking-[0.17px] rounded-md',
        verySmall:
          'px-[5px] py-px text-xs leading-[166%] tracking-[0.4px] rounded-[5px]',
        resourcesNewSize:
          'px-2 py-[6px] md:p-2 rounded-sm md:rounded-md text-xs font-medium lg:text-base',
      },
      variant: {
        light: 'bg-[#CCCCCC80] text-newBlack-3',
        dark: 'bg-newGray-1 text-white',
        orange: 'bg-darkOrange-0 text-darkOrange-6',
        green: 'bg-brightGreen-1 text-brightGreen-7',
        newGray: 'bg-[#ffffff4d] text-white',
      },
    },
    defaultVariants: {
      size: 'large',
      variant: 'light',
    },
  },
);

export interface TextTagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof textTagVariants> {
  asChild?: boolean;
}

const TextTag = React.forwardRef<HTMLDivElement, TextTagProps>(
  ({ className, size, variant, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        className={cn(className, textTagVariants({ size, variant }))}
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
