import * as React from 'react';
import { useMemo, useState } from 'react';
import { TbExclamationMark, TbEye, TbEyeClosed } from 'react-icons/tb';
import { cn } from '#src/lib/utils.ts';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  mandatory?: boolean;
  error?: string | null;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { placeholder, mandatory, error, className, type = 'text', ...props },
    ref,
  ) => {
    const [showValue, setShowValue] = useState(false);

    const classes = useMemo(
      () => [
        'block w-full body-base rounded-md  border border-neutral-200 hover:border-blue-300 focus:border-transparent active:border-transparent focus:ring-2 active:ring-blue-300/10 active:ring-2 focus:ring-blue-300 focus-visible:outline-none px-3 py-3 md:py-4 bg-white text-black placeholder:text-newGray-3',
      ],
      [error],
    );

    const isPassword = type === 'password';

    const inputType = showValue && isPassword ? 'text' : type;

    const inputIcon = useMemo(() => {
      if (isPassword) {
        return showValue ? (
          <TbEye
            className="size-6 cursor-pointer text-neutral-400"
            onClick={() => setShowValue(false)}
            aria-hidden="true"
          />
        ) : (
          <TbEyeClosed
            className="size-6 cursor-pointer text-neutral-400"
            onClick={() => setShowValue(true)}
            aria-hidden="true"
          />
        );
      }

      if (error) {
        return (
          <TbExclamationMark className="size-6 text-red-5" aria-hidden="true" />
        );
      }

      return null;
    }, [error, isPassword, showValue]);

    return (
      <div className={cn('', className ?? '')}>
        <div className="relative rounded-lg">
          <input
            ref={ref}
            type={inputType}
            className={cn(...classes)}
            placeholder={placeholder || ''}
            {...props}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {inputIcon}
          </div>
        </div>
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
