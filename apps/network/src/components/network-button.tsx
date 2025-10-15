import { cn } from '@blms/ui';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva(
  'whitespace-nowrap rounded-[40px] disabled:pointer-events-none w-fit',
  {
    defaultVariants: {
      size: 'm',
      variant: 'primary',
    },
    variants: {
      size: {
        m: 'px-4 py-4 lg:px-6 text-xl lg:text-2xl leading-5 font-medium',
        s: 'px-2 py-2 lg:px-3 text-base lg:text-lg leading-5 font-medium',
      },
      variant: {
        primary:
          'bg-primary text-black shadow-button disabled:!bg-darkOrange-1 disabled:!text-darkOrange-3',
        secondary: 'bg-white  text-headerDark',
        tertiary: 'bg-black !text-white border-2 border-orange-500',
        tag: 'bg-brown-800 !text-brown-500 ',
      },
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const NetworkButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disabled, ...props }, ref) => {
    const Comp = 'button';
    const classes = React.useMemo(
      () => [disabled ? 'cursor-default active:none' : 'active:scale-95'],
      [disabled],
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
NetworkButton.displayName = 'Button';

export { NetworkButton, buttonVariants };
