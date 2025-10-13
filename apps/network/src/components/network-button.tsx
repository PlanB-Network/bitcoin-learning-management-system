import { cn } from '@blms/ui';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden disabled:pointer-events-none w-fit',
  {
    defaultVariants: {
      size: 'm',
      variant: 'primary',
    },
    variants: {
      size: {
        carouselSize: 'p-0 text-base md:text-xl',
        flagsMobile: 'px-2.5 py-3 font-base font-medium',
        l: 'px-4 py-3 text-xl leading-6 !font-medium',
        loginButton: 'py-3 px-4 subtitle-medium-16px',
        m: 'px-3.5 py-3 text-lg leading-5 !font-medium',
        s: 'px-2.5 py-1.5 text-base leading-5 !font-medium',
        xl: 'px-12 py-3 text-xl !font-medium',
        xs: 'px-2 py-1.5 text-xs leading-3 !font-medium',
      },
      variant: {
        primary:
          'bg-primary text-white shadow-button disabled:!bg-darkOrange-1 disabled:!text-darkOrange-3',
        secondary: 'bg-white  text-headerDark',
        tertiary: 'bg-black !text-white border-2 border-orange-500',
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
  glowing?: boolean;
}

const NetworkButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      mode = 'light',
      rounded,
      glowing,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = 'button';
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
          glowing ? 'shadow-md-button' : '',
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
