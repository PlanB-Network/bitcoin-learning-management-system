import { cva } from 'class-variance-authority';

import { cn } from '../lib/utils.ts';

interface DividerProps {
  children?: string;
  width?: string;
  className?: string;
  mode?: 'dark' | 'light';
}

const dividerVariant = cva('w-full border-t', {
  defaultVariants: {
    mode: 'dark',
  },
  variants: {
    mode: {
      dark: 'border-neutral-500',
      light: 'border-neutral-200',
    },
  },
});

export const Divider = ({
  children,
  className = 'mx-4',
  width = 'w-4/5',
  mode = 'dark',
}: DividerProps) => {
  return (
    <div className={cn('relative', className, width)}>
      <div
        className="absolute inset-0 flex w-full items-center"
        aria-hidden="true"
      >
        <div className={cn(dividerVariant({ mode }))} />
      </div>
      {children && (
        <div className="relative flex justify-center">
          <span className="px-2 desktop-body1 text-neutral-500 bg-white">
            {children}
          </span>
        </div>
      )}
    </div>
  );
};

const dividerSimpleVariant = cva('w-full h-px', {
  defaultVariants: {
    variant: 'neutral',
  },
  variants: {
    variant: {
      neutral: 'bg-neutral-50',
      brown: 'bg-brown-100',
    },
  },
});

export const DividerSimple = ({
  className,
  variant = 'neutral',
}: {
  className?: string;
  variant?: 'neutral' | 'brown';
}) => {
  return <div className={cn(dividerSimpleVariant({ variant }), className)} />;
};

const dividerVerticalVariant = cva('w-px', {
  defaultVariants: {
    mode: 'dark',
  },
  variants: {
    mode: {
      dark: 'bg-neutral-500',
      light: 'bg-neutral-500',
    },
  },
});

export const DividerVertical = ({
  className,
  mode = 'dark',
}: {
  className?: string;
  mode?: 'dark' | 'light';
}) => {
  return <div className={cn(dividerVerticalVariant({ mode }), className)} />;
};
