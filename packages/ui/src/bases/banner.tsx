import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import type { IconType } from 'react-icons/lib';
import { cn } from '../lib/utils.ts';

const bannerVariants = cva('relative w-full rounded-lg border p-6', {
  defaultVariants: {
    variant: 'success',
  },
  variants: {
    variant: {
      success: 'bg-green-50 border-green-100 text-green-700',
      info: 'bg-maroon-1 border-maroon-2 text-maroon-7',
    },
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
    <header
      ref={ref}
      className={cn(
        'flex flex-row items-center justify-center',
        bannerVariants({ variant }),
        className,
      )}
      {...props}
    >
      {icon && <span className="size-9 flex items-center mr-5">{icon}</span>}
      <div>{props.children}</div>
    </header>
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
      'flex items-center body-medium-16px md:subtitle-large-med-20px gap-0 md:gap-2',
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
