import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
} from '@blms/ui';
import { cva } from 'class-variance-authority';
import React, { useState } from 'react';
import { TbChevronDown } from 'react-icons/tb';

const CollapsibleDropdownVariant = cva(
  'w-full rounded-[12px] flex flex-col px-2.5 py-[5px] justify-center',
  {
    defaultVariants: {
      variant: 'light',
    },
    variants: {
      variant: {
        dark: '',
        light: 'bg-newGray-6 border-newGray-4',
      },
    },
  },
);

const collapsibleTriggerVariant = cva(
  'flex justify-between items-center py-2',
  {
    defaultVariants: {
      variant: 'light',
    },
    variants: {
      variant: {
        dark: 'text-newBlack-3',
        light: 'text-darkOrange-5',
      },
    },
  },
);

interface MyIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  variant?: 'light' | 'dark';
  className?: string;
  defaultOpen?: boolean;
  icon?: React.ReactElement<MyIconProps>;
}

export const CollapsibleDropdown = ({
  title,
  children,
  variant = 'light',
  className,
  defaultOpen = false,
  icon,
}: CollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(CollapsibleDropdownVariant({ variant }), className)}
    >
      <CollapsibleTrigger className={collapsibleTriggerVariant({ variant })}>
        <div className="flex flex-row gap-2 items-center">
          {icon
            ? React.cloneElement(icon as React.ReactElement<any>, {
                size: icon.props?.size || 16,
                className: cn(icon.props?.className),
              })
            : null}
          <span className="body-14px-medium md:body-16px-medium">{title}</span>
        </div>
        <TbChevronDown
          size={20}
          className={cn('transition-all', isOpen && 'rotate-180')}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
};
