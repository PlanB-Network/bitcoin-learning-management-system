/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Link, useParams } from '@tanstack/react-router';
import { useContext, useEffect, useRef, useState } from 'react';

import { AppContext } from '#src/providers/context.js';

import { MainLayout } from '../../../components/MainLayout/index.tsx';
import { trpc } from '../../../utils/index.ts';

enum ValidationStatus {
  VALIDATING,
  SUCCESS,
  ERROR,
}

export const ValidateEmailChangePage = () => {
  const { token } = useParams({ from: '/validate-email/$token' });
  const { user, setUser } = useContext(AppContext);
  const [email, setEmail] = useState<string | null>(null);

  const [validationStatus, setValidationStatus] = useState<ValidationStatus>(
    ValidationStatus.VALIDATING,
  );

  const hasValidated = useRef(false);

  // Call the API to validate the email change
  const validateEmailChange = trpc.user.validateEmailChange.useMutation({
    onSuccess: ({ email }) => {
      if (email) {
        setEmail(email);
        setValidationStatus(ValidationStatus.SUCCESS);
        if (user) {
          setUser({ ...user, email });
        }
      } else {
        setValidationStatus(ValidationStatus.ERROR);
      }
    },
    onError: () => {
      setValidationStatus(ValidationStatus.ERROR);
    },
  });

  useEffect(() => {
    if (!hasValidated.current) {
      console.log('Validating email change', token);
      validateEmailChange.mutate({ token });
      hasValidated.current = true;
    }
  }, [token, validateEmailChange]);

  const validationMessages = {
    [ValidationStatus.VALIDATING]: (
      <div>
        <h1 className="mb-10 text-4xl font-bold lg:text-5xl">
          Validating email change
        </h1>
        <p className="my-8">This won’t take long</p>
      </div>
    ),
    [ValidationStatus.SUCCESS]: (
      <div>
        <h1 className="mb-10 text-4xl font-bold lg:text-5xl">
          Email change validated
        </h1>
        <p className="my-8">
          Your email has been successfully changed to {email ?? 'null'}
        </p>
        <p>
          <Link
            className="cursor-pointer hover:text-orange-500"
            to={user ? '/dashboard' : '/'}
          >
            {user ? 'Go to dashboard' : 'Go to home'}
          </Link>
        </p>
      </div>
    ),
    [ValidationStatus.ERROR]: (
      <div>
        <h1 className="mb-10 text-4xl font-bold lg:text-5xl">
          Error validating email change
        </h1>
        <p className="my-8 max-w-2xl">
          An error occurred while validating your email change, it seems like
          the link or expired or has already been used. Please try again.
        </p>
        <p>
          <Link
            className="cursor-pointer hover:text-orange-500"
            to={user ? '/dashboard' : '/'}
          >
            {user ? 'Go to dashboard' : 'Go to home'}
          </Link>
        </p>
      </div>
    ),
  };

  return (
    <MainLayout footerVariant="dark">
      <div className="font-primary bg-black flex size-full flex-col items-center space-y-16 p-10 text-blue-700">
        <section className="max-w-4xl text-white flex min-h-[50vh] flex-col items-center justify-center">
          {validationMessages[validationStatus]}
        </section>
      </div>
    </MainLayout>
  );
};
