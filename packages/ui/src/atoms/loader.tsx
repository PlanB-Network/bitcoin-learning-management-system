import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

import spinnerBlack from '../assets/icons/spinner_black.svg';
import spinnerOrange from '../assets/icons/spinner_orange.svg';
import { cn } from '../lib/utils.js';

const loaderVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      size: {
        s: 'size-24 md:size-32 mx-auto',
        m: 'size-32 md:size-64 mx-auto',
        xl: 'size-48 md:size-64 mx-auto',
      },
    },
    defaultVariants: {
      size: 'm',
    },
  },
);

interface LoaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loaderVariants> {
  variant?: 'black' | 'orange';
}

const Loader = ({ variant = 'orange', size, ...props }: LoaderProps) => {
  let imgSrc;
  if (variant === 'black') {
    imgSrc = spinnerBlack;
  } else if (variant === 'orange') {
    imgSrc = spinnerOrange;
  } else {
    imgSrc = spinnerOrange;
  }

  return (
    <div className="text-center">
      <img
        src={imgSrc}
        alt="spinner"
        className={cn(loaderVariants({ size }))}
        {...props}
      />
    </div>
  );
};

export { Loader, loaderVariants };
