import type { DetailedHTMLProps, InputHTMLAttributes } from 'react';
import { useMemo, useState } from 'react';
import { BsExclamationTriangle, BsEye, BsEyeSlash } from 'react-icons/bs';

import { cn } from '@blms/ui';

import type { BaseAtomProps } from '../types.tsx';

type BaseProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> &
  BaseAtomProps;

interface TextInputProps extends BaseProps {
  labelText?: string;
  placeholder?: string;
  cornerHint?: string;
  mandatory?: boolean;
  error?: string | null;
}

export const TextInput = ({
  labelText,
  placeholder,
  cornerHint,
  error,
  mandatory,
  className,
  ...rest
}: TextInputProps) => {
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

  const isPassword = rest?.type === 'password';

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

    if (error)
      return (
        <BsExclamationTriangle
          className="size-5 text-red-100"
          aria-hidden="true"
        />
      );

    return null;
  }, [error, isPassword, showValue]);

  return (
    <div className={cn('my-2', className ?? '')}>
      <div className="flex flex-col justify-between text-center mb-2">
        <label
          htmlFor="email"
          className="max-md:text-sm max-md:leading-[120%] md:desktop-h7 text-[#050A14]"
        >
          {labelText} {mandatory && <span className="text-[#E72940]">*</span>}
        </label>
        {cornerHint && (
          <span
            className="max-md:leading-[120%] leading-6 text-newGray-1"
            id="email-optional"
          >
            {cornerHint}
          </span>
        )}
      </div>
      <div className="relative rounded-md">
        <input
          className={cn(...classes)}
          placeholder={placeholder || ''}
          {...rest}
          {...(showValue && { type: 'text' })}
        />
        {/* Input right icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {inputIcon}
        </div>
      </div>
      {error && (
        <p className="mt-0.5 px-1 text-sm text-red-1" id="email-error">
          {error}
        </p>
      )}
    </div>
  );
};
