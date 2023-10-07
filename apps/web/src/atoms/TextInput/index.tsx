import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  useMemo,
  useState,
} from 'react';
import { BsExclamationTriangle, BsEye, BsEyeSlash } from 'react-icons/bs';

import { compose } from '../../utils';
import { BaseAtomProps } from '../types';

type BaseProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> &
  BaseAtomProps;

interface TextInputProps extends BaseProps {
  labelText?: string;
  cornerHint?: string;
  error?: string | null;
}

export const TextInput = ({
  labelText,
  cornerHint,
  error,
  className,
  ...rest
}: TextInputProps) => {
  const [showValue, setShowValue] = useState(false);
  const classes = useMemo(
    () => [
      'block w-full rounded-[15px] border-0 focus:ring-2 focus:ring-inset px-3 py-4 bg-orange-400',
      error
        ? 'text-red-300 ring-red-200 ring-1 placeholder:text-red-200 focus:ring-red-300'
        : 'text-gray-600 shadow-sm placeholder:text-gray-400 focus:ring-blue-600',
    ],
    [error],
  );

  const isPassword = rest?.type === 'password';

  const inputIcon = useMemo(() => {
    if (isPassword) {
      return showValue ? (
        <BsEyeSlash
          className="h-5 w-5 cursor-pointer"
          onClick={() => setShowValue(false)}
          aria-hidden="true"
        />
      ) : (
        <BsEye
          className="h-5 w-5 cursor-pointer"
          onClick={() => setShowValue(true)}
          aria-hidden="true"
        />
      );
    }

    if (error)
      return (
        <BsExclamationTriangle
          className="h-5 w-5 text-red-100"
          aria-hidden="true"
        />
      );

    return null;
  }, [error, isPassword, showValue]);

  return (
    <div className={compose('mx-4 my-2', className ?? '')}>
      <div className="items-c flex flex-col justify-between px-1 text-center">
        <label
          htmlFor="email"
          className="mb-1 block text-lg font-normal leading-6 text-gray-600"
        >
          {labelText}
        </label>
        {cornerHint && (
          <span className="text-lg leading-6 text-gray-500" id="email-optional">
            {cornerHint}
          </span>
        )}
      </div>
      <div className="relative rounded-md shadow-sm">
        <input
          className={compose(...classes)}
          {...rest}
          {...(showValue && { type: 'text' })}
        />
        {/* Input right icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {inputIcon}
        </div>
      </div>
      {error && (
        <p className="mt-0.5 px-1 text-sm text-red-300" id="email-error">
          {error}
        </p>
      )}
    </div>
  );
};
