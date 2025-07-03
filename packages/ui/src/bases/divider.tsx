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
      dark: 'border-newGray-1',
      light: 'border-newGray-4',
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
          <span className="px-2 desktop-body1 text-newGray-1 bg-white">
            {children}
          </span>
        </div>
      )}
    </div>
  );
};

const dividerSimpleVariant = cva('w-full h-px', {
  defaultVariants: {
    mode: 'dark',
  },
  variants: {
    mode: {
      dark: 'bg-newGray-1',
      light: 'bg-newGray-4',
    },
  },
});

export const DividerSimple = ({
  className,
  mode = 'dark',
}: {
  className?: string;
  mode?: 'dark' | 'light';
}) => {
  return <div className={cn(dividerSimpleVariant({ mode }), className)} />;
};

const dividerVerticalVariant = cva('w-px', {
  defaultVariants: {
    mode: 'dark',
  },
  variants: {
    mode: {
      dark: 'bg-newGray-1',
      light: 'bg-newGray-1',
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
