import * as React from 'react';
import { useMemo, useState } from 'react';
import { BsExclamationTriangle, BsEye, BsEyeSlash } from 'react-icons/bs';
import { cn } from '#src/lib/utils.ts';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  labelText?: string;
  placeholder?: string;
  cornerHint?: string;
  mandatory?: boolean;
  error?: string | null;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      labelText,
      placeholder,
      cornerHint,
      mandatory,
      error,
      className,
      type = 'text',
      ...props
    },
    ref,
  ) => {
    const [showValue, setShowValue] = useState(false);

    const classes = useMemo(
      () => [
        'block w-full rounded-md border border-[rgba(115,115,115,0.10)] focus:ring-2 focus:ring-inset px-4 py-2.5 bg-[#E9E9E9] max-md:text-sm max-md:leading-[120%] md:desktop-subtitle1',
        error
          ? 'text-red-300 placeholder:text-red-300 focus:ring-red-300'
          : 'text-black placeholder:text-newGray-1',
      ],
      [error],
    );

    const isPassword = type === 'password';

    const inputType = showValue && isPassword ? 'text' : type;

    const inputIcon = useMemo(() => {
      if (isPassword) {
        return showValue ? (
          <BsEyeSlash
            className="size-5 cursor-pointer"
            onClick={() => setShowValue(false)}
            aria-hidden="true"
          />
        ) : (
          <BsEye
            className="size-5 cursor-pointer"
            onClick={() => setShowValue(true)}
            aria-hidden="true"
          />
        );
      }

      if (error) {
        return (
          <BsExclamationTriangle
            className="size-5 text-red-100"
            aria-hidden="true"
          />
        );
      }

      return null;
    }, [error, isPassword, showValue]);

    return (
      <div className={cn('', className ?? '')}>
        {labelText && (
          <div className="flex flex-col justify-between text-center mb-2">
            <label
              className="max-md:text-sm max-md:leading-[120%] md:desktop-h7 text-dashboardSectionText"
              htmlFor={`${labelText}-optional`}
            >
              {labelText}{' '}
              {mandatory && <span className="text-[#E72940]">*</span>}
            </label>
            {cornerHint && (
              <span
                className="max-md:leading-[120%] leading-6 text-newGray-1"
                id={`${labelText}-optional`}
              >
                {cornerHint}
              </span>
            )}
          </div>
        )}
        <div className="relative rounded-md">
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
        {error && (
          <p
            className="mt-0.5 px-1 text-sm text-red-5"
            id={`${labelText}-error`}
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
