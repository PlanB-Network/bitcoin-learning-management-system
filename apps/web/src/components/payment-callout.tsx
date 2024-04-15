import { AiOutlineWarning } from 'react-icons/ai';

interface PaymentCalloutProps {
  description: string;
}

const borderClassName = 'border border-gray-400/25 rounded-xl overflow-hidden';

export const PaymentCallout = ({ description }: PaymentCalloutProps) => {
  return (
    <div
      className={`${borderClassName} flex flex-row items-center w-full rounded-2xl px-4 py-2 cursor-pointer`}
    >
      <AiOutlineWarning className="size-6" />
      <span className="text-sm flex-1 text-center ml-0.5">{description}</span>
    </div>
  );
};
