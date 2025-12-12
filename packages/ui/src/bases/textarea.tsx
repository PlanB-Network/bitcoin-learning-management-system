import * as React from 'react';

import { cn } from '#src/lib/utils.ts';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'block min-h-20 w-full body-base rounded-md border border-neutral-200 hover:border-blue-300 focus:border-transparent active:border-transparent focus:ring-2 active:ring-blue-300/10 active:ring-2 focus:ring-blue-300 focus-visible:outline-none px-3 py-3 md:py-4 bg-white text-black placeholder:text-newGray-3 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
