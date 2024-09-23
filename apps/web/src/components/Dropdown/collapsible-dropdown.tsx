import { cva } from 'class-variance-authority';
import { useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
} from '@blms/ui';

const CollapsibleDropdownVariant = cva(
  'w-full max-w-[464px] rounded-[12px] flex flex-col px-2.5 py-[5px] justify-center',
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
        dark: '',
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
}

export const CollapsibleDropdown = ({
  title,
  children,
  variant = 'light',
  className,
}: CollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(CollapsibleDropdownVariant({ variant }), className)}
    >
      <CollapsibleTrigger className={collapsibleTriggerVariant({ variant })}>
        <span className="font-medium leading-[110%] tracking-015px">
          {title}
        </span>
        <MdKeyboardArrowDown
          size={30}
          className={cn('transition-all', isOpen && 'rotate-180')}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
};
