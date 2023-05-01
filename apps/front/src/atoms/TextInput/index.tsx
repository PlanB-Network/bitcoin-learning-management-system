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
      'block w-full rounded-md border-0 py-1.5 ring-1 ring-inset focus:ring-2 focus:ring-inset px-3',
      error
        ? 'text-danger-300 ring-danger-200 placeholder:text-danger-200 focus:ring-danger-300'
        : 'text-gray-600 shadow-sm ring-gray-300 placeholder:text-gray-400 focus:ring-primary-600',
    ],
    [error]
  );

  const isPassword = rest?.type === 'password';

  const inputIcon = useMemo(() => {
    if (isPassword) {
      return showValue ? (
        <BsEyeSlash
          className="w-5 h-5 cursor-pointer"
          onClick={() => setShowValue(false)}
          aria-hidden="true"
        />
      ) : (
        <BsEye
          className="w-5 h-5 cursor-pointer"
          onClick={() => setShowValue(true)}
          aria-hidden="true"
        />
      );
    }

    if (error)
      return (
        <BsExclamationTriangle
          className="w-5 h-5 text-danger-100"
          aria-hidden="true"
        />
      );

    return null;
  }, [error, isPassword, showValue]);

  return (
    <div className={compose('mx-4 my-2', className ?? '')}>
      <div className="flex justify-between px-1">
        <label
          htmlFor="email"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {labelText}
        </label>
        {cornerHint && (
          <span className="text-sm leading-6 text-gray-500" id="email-optional">
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
        <div className="flex absolute inset-y-0 right-0 items-center pr-3">
          {inputIcon}
        </div>
      </div>
      {error && (
        <p className="px-1 mt-0.5 text-sm text-danger-300" id="email-error">
          {error}
        </p>
      )}
    </div>
  );
};
