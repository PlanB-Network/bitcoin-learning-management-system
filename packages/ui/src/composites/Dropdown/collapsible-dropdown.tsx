import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
} from '@blms/ui';
import { cva } from 'class-variance-authority';
import { useState } from 'react';
import { LuCircleAlert } from 'react-icons/lu';
import { MdKeyboardArrowDown } from 'react-icons/md';

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
  'flex justify-between items-center py-2 pl-[5px]',
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
