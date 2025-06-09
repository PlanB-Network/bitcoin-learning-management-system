import { cva } from 'class-variance-authority';
import { useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
} from '@blms/ui';
import { LuCircleAlert } from 'react-icons/lu';

const CollapsibleDropdownVariant = cva(
  'w-full rounded-[12px] flex flex-col px-2.5 py-[5px] justify-center',
  {
    variants: {
      variant: {
        light: 'bg-newGray-6 border-newGray-4',
        dark: '',
      },
    },
    defaultVariants: {
      variant: 'light',
    },
  },
);

const collapsibleTriggerVariant = cva(
  'flex justify-between items-center py-2 pl-[5px]',
  {
    variants: {
      variant: {
        light: 'text-darkOrange-5',
        dark: 'text-newBlack-3',
      },
    },
    defaultVariants: {
      variant: 'light',
    },
  },
);

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  variant?: 'light' | 'dark';
  className?: string;
  defaultOpen?: boolean;
  type?: string;
}

export const CollapsibleDropdown = ({
  title,
  children,
  variant = 'light',
  className,
  defaultOpen = false,
  type,
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
          {type === 'info' ? <LuCircleAlert className="h-4 w-4" /> : null}
          <span className="body-14px-medium md:body-16px-medium">{title}</span>
        </div>
        <MdKeyboardArrowDown
          size={30}
          className={cn('transition-all', isOpen && 'rotate-180')}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
};
