import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';
import { IoMdClose } from 'react-icons/io';

import { cn } from '@blms/ui';

interface DialogTitleProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> {
  variant?: 'orange' | 'black';
}

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  showCloseButton?: boolean;
  showAccountHelper?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    {
      className,
      children,
      showCloseButton = true,
      showAccountHelper = false,
      ...props
    },
    ref,
  ) => {
    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            'my-2 max-h-[95%] overflow-scroll no-scrollbar fixed left-1/2 top-1/2 z-50 grid -translate-x-1/2 -translate-y-1/2 gap-4 border bg-white py-2 px-4 rounded-[1.5em]',
            className,
          )}
          {...props}
        >
          {showCloseButton && (
            <DialogPrimitive.Close className="flex justify-end rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-white data-[state=open]:text-muted-foreground">
              <IoMdClose className="size-6" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
          {children}
          {showAccountHelper && (
            <div className="flex flex-col items-center text-center px-0.5 sm:px-5 mx-auto">
              <div className="h-px bg-darkOrange-5 w-full max-w-40 rounded-3xl mb-2.5" />
              <span className="max-md:mobile-h3 md:desktop-h7 text-darkOrange-5">
                Did you know ?
              </span>
              <span className="text-darkOrange-5">
                No need for an account to start learning at Plan B Network !
              </span>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  DialogTitleProps
>(({ className, variant = 'orange', ...props }, ref) => {
  const baseClass = '';
  const variantStyles = {
    orange:
      'text-center mobile-h2 md:desktop-h4 text-darkOrange-5 px-0.5 sm:px-5',
    black: 'text-black px-2 mb-4 text-center',
  };
  const variantClassName = variantStyles[variant] || variantStyles.orange;

  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(baseClass, variantClassName, className)}
      {...props}
    />
  );
});
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
