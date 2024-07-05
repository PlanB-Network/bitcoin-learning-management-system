import { Link, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@sovereign-university/ui';

import { TextInput } from '#src/atoms/TextInput/index.js';

import { MainLayout } from '../../../components/MainLayout/index.tsx';
import { trpc } from '../../../utils/index.ts';

enum PageState {
  CHECKING, // Checking if the token is valid
  INVALID, // Token is invalid
  FORM, // Form to reset the password
  SENDING, // Sending the new password
  SUCCESS, // Password changed successfully
  ERROR, // An error occurred
}

export const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const { token } = useParams({ from: '/reset-password/$token' });

  const [pageState, setPageState] = useState<PageState>(PageState.CHECKING);

  const { data: tokenInfo, isFetched } = trpc.user.tokenInfo.useQuery({
    token,
  });

  console.log('Token info:', tokenInfo);

  // Check if the token is valid
  useEffect(() => {
    if (!isFetched) {
      return;
    }

    if (
      !tokenInfo ||
      tokenInfo.expired ||
      tokenInfo.consumed ||
      tokenInfo.type !== 'reset_password'
    ) {
      setPageState(PageState.INVALID);
      return;
    }

    setPageState(PageState.FORM);
  }, [tokenInfo, isFetched]);

  // Call the API to validate the email change
  const sendNewPassword = trpc.user.resetPassword.useMutation({
    onSuccess: () => {
      setPageState(PageState.SUCCESS);
    },
    onError: () => {
      setPageState(PageState.ERROR);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!tokenInfo) {
      setPageState(PageState.ERROR);
      return;
    }

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const newPassword = formData.get('password') as string;
    sendNewPassword.mutate({ resetToken: tokenInfo.id, newPassword });
    setPageState(PageState.SENDING);
  };

  const validationMessages = {
    [PageState.FORM]: (
      <div>
        <h1 className="mb-10 text-4xl font-bold lg:text-5xl">
          Reset your password
        </h1>
        <p className="my-8">
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col items-center mt-3"
          >
            <TextInput
              name="password"
              type="password"
              placeholder="New password"
              className="w-full"
            />

            <Button
              variant="newPrimary"
              size="m"
              type="submit"
              className="my-8"
            >
              {t('auth.passwordReinit')}
            </Button>
          </form>
        </p>
      </div>
    ),
    [PageState.SENDING]: (
      <div>
        <h1 className="mb-10 text-4xl font-bold lg:text-5xl">
          Validating password change
        </h1>
        <p className="my-8">This won’t take long...</p>
      </div>
    ),
    [PageState.SUCCESS]: (
      <div>
        <h1 className="mb-10 text-4xl font-bold lg:text-5xl">
          Password changed
        </h1>
        <p className="my-8">
          Your password has been successfully changed. You can now log in with
          your new password.
        </p>
      </div>
    ),
    [PageState.ERROR]: (
      <div>
        <h1 className="mb-10 text-4xl font-bold lg:text-5xl">
          Error validating password change
        </h1>
        <p className="my-8 max-w-2xl">
          An error occurred while validating your password change. Please try
          again.
        </p>
        <p>
          <Link className="cursor-pointer hover:text-orange-500" to="/">
            Go to home
          </Link>
        </p>
      </div>
    ),
    [PageState.INVALID]: (
      <div>
        <h1 className="mb-10 text-4xl font-bold lg:text-5xl">Invalid token</h1>
        <p className="my-8 max-w-2xl">
          {tokenInfo
            ? tokenInfo.expired
              ? 'The token has expired'
              : tokenInfo.consumed
                ? 'The token has already been used'
                : 'The token is invalid'
            : 'Token not found'}
        </p>
        <p>
          <Link className="cursor-pointer hover:text-orange-500" to="/">
            Go to home
          </Link>
        </p>
      </div>
    ),
    [PageState.CHECKING]: (
      <div>
        <h1 className="mb-10 text-4xl font-bold lg:text-5xl">Checking token</h1>
        <p className="my-8 max-w-2xl">
          We are checking if the token is valid...
        </p>
      </div>
    ),
  };

  return (
    <MainLayout footerVariant="dark">
      <div className="font-primary bg-black flex size-full flex-col items-center space-y-16 p-10 text-blue-700">
        <section className="max-w-4xl text-white flex min-h-[50vh] flex-col items-center justify-center">
          {validationMessages[pageState]}
        </section>
      </div>
    </MainLayout>
  );
};
