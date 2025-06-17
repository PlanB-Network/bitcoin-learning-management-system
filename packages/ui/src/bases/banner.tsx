import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';
import type { IconType } from 'react-icons/lib';
import { cn } from '../lib/utils.ts';

const bannerVariants = cva('relative w-full rounded-lg border p-4', {
  variants: {
    variant: {
      success: 'bg-brightGreen-1 border-brightGreen-2 text-brightGreen-8',
    },
  },
  defaultVariants: {
    variant: 'success',
  },
});

const Banner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof bannerVariants> & {
      onClose?: () => void;
    } & { icon?: React.ReactNode }
>(({ className, variant, icon, onClose, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="banner"
      className={cn(
        'flex flex-row items-center justify-center',
        bannerVariants({ variant }),
        className,
      )}
      {...props}
    >
      {icon && <span className="size-9 flex items-center mr-4">{icon}</span>}
      <div>{props.children}</div>
    </div>
  );
});
Banner.displayName = 'Banner';

const BannerTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { icon?: IconType }
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      ' flex items-center md:text-xl font-medium gap-0 md:gap-2',
      className,
    )}
    {...props}
  >
    {props.children}
  </h5>
));
BannerTitle.displayName = 'BannerTitle';

const BannerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('body-16px whitespace-pre-line', className)}
    {...props}
  />
));
BannerDescription.displayName = 'BannerDescription';

export { Banner, BannerTitle, BannerDescription };
