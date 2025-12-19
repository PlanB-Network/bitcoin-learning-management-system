import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';
import { IoMdClose } from 'react-icons/io';
import { TbX } from 'react-icons/tb';
import CroppedPill from '#src/assets/icons/cropped_pill.svg';
import { cn } from '#src/lib/utils.ts';

interface DialogTitleProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> {
  variant?: 'orange' | 'black';
}

interface BasicModalProps {
  trigger?: React.ReactNode;
  title?: string;
  content?: React.ReactNode;
  iconSrc?: string;
  iconAlt?: string;
  showPill?: boolean;
  children?: React.ReactNode;
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
      'fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
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
          'flex flex-col my-2 max-h-[95%] max-w-[90%] overflow-scroll no-scrollbar fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-[0px_2px_60px_-15px_rgba(0,0,0,0.50)]',
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
>(({ className, variant = 'black', ...props }, ref) => {
  const baseClass = 'text-center';
  const variantStyles = {
    black: 'text-black',
    orange: 'text-orange-500',
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
  iconSrc,
  iconAlt = 'Icon',
  showPill,
  children,
  contentClassName,
  open,
  onOpenChange,
}: BasicModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn('w-full max-w-[min(90%,496px)]', contentClassName)}
        showCloseButton={false}
      >
        <div
          className={cn(
            'w-full flex justify-between items-center bg-neutral-50 border-b border-b-neutral-100 sticky top-0 z-10',
          )}
        >
          <div className="w-6.5 md:w-9.5 self-end mx-6 shrink-0">
            {showPill && (
              <img src={CroppedPill} alt="Cropped Pill" className="w-full" />
            )}
          </div>
          <DialogTitle className="whitespace-pre-line subtitle-small md:subtitle-base px-4 py-3 min-h-10 md:min-h-12">
            {title}
          </DialogTitle>
          <DialogPrimitive.Close>
            <TbX className="size-7 md:size-8 shrink-0 mx-4 text-neutral-400 p-1 hover:bg-neutral-100 rounded-lg" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>

        <div className="flex flex-col items-center text-center gap-5 md:gap-8 p-4 md:p-6">
          {iconSrc && (
            <img src={iconSrc} alt={iconAlt} className="size-10 md:size-15" />
          )}

          <DialogDescription
            className={cn(content ? 'whitespace-pre-line w-full' : 'hidden')}
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
