import { cn } from '@blms/ui';

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
  value: string;
  isBlack?: boolean;
  isLabelBold?: boolean;
}

export const PaymentRow = ({
  label,
  value,
  isBlack,
  isLabelBold,
}: PaymentRowProps) => {
  const splitValue = value.includes('\n') && value.split('\n');

  return (
    <div className="flex items-center justify-between w-full leading-relaxed">
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
