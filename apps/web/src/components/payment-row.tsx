interface RowTextProps {
  children: string;
  className?: string;
}

const RowText = ({
  children,
  className = '',
}: RowTextProps & { className?: string }) => (
  <span className={`text-sm ${className}`}>{children}</span>
);

interface PaymentRowProps {
  label: string;
  value: string;
  isBlack?: boolean;
}

export const PaymentRow = ({ label, value, isBlack }: PaymentRowProps) => (
  <div className="flex h-10 items-center justify-between w-full">
    <RowText className={`${isBlack ? 'text-slate-950' : 'text-white/[.64]'}`}>
      {label}
    </RowText>
    <RowText
      className={`text-end text-wrap max-w-[70%] truncate ${isBlack ? 'text-slate-950' : 'text-white'}`}
    >
      {value}
    </RowText>
  </div>
);
