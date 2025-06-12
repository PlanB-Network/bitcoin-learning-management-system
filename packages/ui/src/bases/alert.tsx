import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { IoMdClose } from 'react-icons/io';
import type { IconType } from 'react-icons/lib';
import { cn } from '../lib/utils.js';

const alertVariants = cva('relative w-full rounded-lg border p-4', {
  variants: {
    variant: {
      default: 'bg-darkOrange-0 border-darkOrange-1 text-foreground',
      transparent: 'border-newGray-4',
      warning: 'bg-darkOrange-0 border-darkOrange-1 text-darkOrange-9',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof alertVariants> & {
      hasCloseButton?: boolean;
      onClose?: () => void;
    }
>(({ className, variant, hasCloseButton, onClose, ...props }, ref) => {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {hasCloseButton && (
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-full"
          aria-label="Close alert"
          type="button"
        >
          <IoMdClose className={cn('size-5 text-newGray-1')} />
        </button>
      )}
      {props.children}
    </div>
  );
});
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { icon?: IconType }
>(({ className, icon: Icon, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      'mb-1 md:mb-4 body-14px-medium md:body-16px-medium text-darkOrange-9 flex items-center gap-3 md:gap-2',
      className,
    )}
    {...props}
  >
    {Icon && <Icon className="size-4.5" />}
    {props.children}
  </h5>
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('body-16px whitespace-pre-line', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
