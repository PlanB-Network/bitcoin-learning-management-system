import { cn } from '@blms/ui';

import type { JSX } from 'react';

interface RowTextProps {
  children: string | JSX.Element[];
  className?: string;
}

const RowText = ({
  children,
  className = '',
}: RowTextProps & { className?: string }) => (
  <span className={cn('text-sm', className)}>{children}</span>
);

interface PaymentRowProps {
  label: string;
  value: string | JSX.Element[];
  isBlack?: boolean;
  isLabelBold?: boolean;
}

export const PaymentRow = ({
  label,
  value,
  isBlack,
  isLabelBold,
}: PaymentRowProps) => {
  const splitValue =
    typeof value === 'string' && value.includes('\n') && value.split('\n');

  return (
    <div className="flex items-center justify-between w-full leading-relaxed max-md:my-[1px]">
      <RowText
        className={cn(
          'text-sm lg:text-base tracking-[0.08px] self-start',
          isBlack ? 'text-slate-950' : 'text-newGray-1 lg:text-white/[.64]',
          isLabelBold ? 'font-semibold' : '',
        )}
      >
        {label}
      </RowText>
      <RowText
        className={cn(
          'text-sm lg:text-base text-end text-wrap max-w-[70%] truncate',
          isBlack ? 'text-slate-950' : 'text-black lg:text-white',
          typeof value !== 'string' && 'flex flex-wrap gap-2',
        )}
      >
        {splitValue
          ? splitValue.map((v) => (
              <span className="block" key={v}>
                {v}
              </span>
            ))
          : value}
      </RowText>
    </div>
  );
};
