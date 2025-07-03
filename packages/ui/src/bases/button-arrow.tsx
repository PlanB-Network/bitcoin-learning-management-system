import type { ButtonProps } from '@blms/ui';
import { Button, cn } from '@blms/ui';
import React from 'react';
import { FaArrowRightLong } from 'react-icons/fa6';

interface ButtonWithArrowProps extends ButtonProps {
  children: React.ReactNode;
}

export const ButtonWithArrow = React.forwardRef<
  HTMLButtonElement,
  ButtonWithArrowProps
>(({ children, ...props }, ref) => {
  return (
    <Button {...props} ref={ref}>
      <span className={cn('flex items-center')}>
        {children}
        <FaArrowRightLong
          className={cn(
            'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 lg:group-hover/arrow:max-w-96 lg:group-hover/arrow:opacity-100',
            'lg:group-hover/arrow:ml-3',
          )}
        />
      </span>
    </Button>
  );
});

ButtonWithArrow.displayName = 'ButtonWithArrow';
