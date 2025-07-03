import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';
import { IoMdClose } from 'react-icons/io';
import PlanBLogoBlack from '#src/assets/logo/planb_logo_horizontal_black.svg';

import { cn } from '#src/lib/utils.ts';

interface DialogTitleProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> {
  variant?: 'orange' | 'black';
}

interface BasicModalProps {
  trigger?: React.ReactNode;
  title?: string;
  content?: React.ReactNode;
  showLogo?: boolean;
  iconSrc?: string;
  iconAlt?: string;
  children?: React.ReactNode;
  showCloseButton?: boolean;
  titleVariant?: 'orange' | 'black';
  contentClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, showCloseButton = true, ...props }, ref) => {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'flex flex-col my-2 max-h-[95%] max-w-[90%] overflow-scroll no-scrollbar fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 gap-4 border bg-white py-5 px-4 md:p-6 rounded-[1.5em]',
          className,
        )}
        {...props}
      >
        {showCloseButton && (
          <DialogPrimitive.Close className="absolute top-4 right-4 flex rounded-xs justify-end opacity-100 transition-opacity hover:opacity-70 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-white data-[state=open]:text-muted-foreground">
            <IoMdClose className="size-5 md:size-6" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col text-center', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  DialogTitleProps
>(({ className, variant = 'orange', ...props }, ref) => {
  const baseClass = 'text-center subtitle-large-18px md:title-large-24px';
  const variantStyles = {
    black: 'text-black',
    orange: 'text-darkOrange-5',
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
    className={cn('body-14px md:subtitle-large-18px', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const BasicModal = ({
  trigger,
  title,
  content,
  showLogo = false,
  iconSrc,
  iconAlt = 'Icon',
  children,
  showCloseButton = true,
  titleVariant = 'orange',
  contentClassName,
  open,
  onOpenChange,
}: BasicModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          'gap-6 md:gap-15 w-full max-w-[90%] sm:max-w-[544px]',
          contentClassName,
        )}
        showCloseButton={showCloseButton}
      >
        {showLogo && (
          <img
            src={PlanBLogoBlack}
            alt="Logo"
            className="w-[186px] md:w-[266px] mx-auto pt-6 md:pt-3"
          />
        )}

        <div className="flex flex-col items-center text-center gap-5 md:gap-8 py-5">
          <DialogTitle
            variant={titleVariant}
            className="whitespace-pre-line md:max-w-[422px]"
          >
            {title}
          </DialogTitle>

          {iconSrc && (
            <img src={iconSrc} alt={iconAlt} className="size-10 md:size-15" />
          )}

          <DialogDescription
            className={cn(
              content ? 'whitespace-pre-line md:max-w-[422px]' : 'hidden',
            )}
            asChild
          >
            {content ? content : <span>{title}</span>}
          </DialogDescription>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

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
  BasicModal,
};
