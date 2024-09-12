import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils.js';

const textTagVariants = cva(
  'bg-[#CCCCCC80] justify-center items-center gap-2 inline-flex',
  {
    variants: {
      size: {
        large: 'p-2 text-base font-medium leading-none rounded-md',
        small:
          'px-2 py-[3px] text-sm leading-[143%] tracking-[0.17px] rounded-md',
        verySmall:
          'px-[5px] py-px text-xs leading-[166%] tracking-[0.4px] rounded-[5px]',
      },
    },
    defaultVariants: {
      size: 'large',
    },
  },
);

export interface TextTagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof textTagVariants> {
  asChild?: boolean;
}

const TextTag = React.forwardRef<HTMLDivElement, TextTagProps>(
  ({ className, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        className={cn(textTagVariants({ size, className }))}
        ref={ref}
        {...props}
      >
        <div className="text-newBlack-3">{children}</div>
      </Comp>
    );
  },
);
TextTag.displayName = 'TextTag';

export { TextTag, textTagVariants };
