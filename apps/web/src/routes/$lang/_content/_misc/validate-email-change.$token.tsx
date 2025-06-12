import { Link, createFileRoute } from '@tanstack/react-router';
import { useContext, useEffect, useRef, useState } from 'react';
import { z } from 'zod';

import { Button } from '@blms/ui';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '#src/components/main-layout.js';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';

enum ValidationStatus {
  VALIDATING,
  SUCCESS,
  ERROR,
}

export const Route = createFileRoute(
  '/$lang/_content/_misc/validate-email-change/$token',
)({
  params: {
    parse: (params) => ({
      lang: z.string().parse(params.lang),
      token: z.string().parse(params.token),
    }),
    stringify: ({ lang, token }) => ({
      lang: lang,
      token: `${token}`,
    }),
  },
  component: ValidateEmailChangePage,
});

function ValidateEmailChangePage() {
  const { t } = useTranslation();

  const params = Route.useParams();
  const token = params.token;

  const { user, setUser } = useContext(AppContext);
  const [email, setEmail] = useState<string | null>(null);

  const [validationStatus, setValidationStatus] = useState<ValidationStatus>(
    ValidationStatus.VALIDATING,
  );

  const hasValidated = useRef(false);

  // Call the API to validate the email change
  const validateEmailChange = useMutation(
    trpc.user.validateEmailChange.mutationOptions({
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
    }),
  );

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
          {t('auth.emailValidation.validatingEmailChange')}
        </h1>
        <p className="my-8">{t('auth.emailValidation.wontTakeLong')}</p>
      </div>
    ),
    [ValidationStatus.SUCCESS]: (
      <div>
        <h1 className="mb-10 text-4xl font-bold lg:text-5xl">
          {t('auth.emailValidation.emailChangeValidated')}
        </h1>
        <p className="my-8">
          {t('auth.emailValidation.successfullyChanged', {
            email: email ?? 'null',
          })}
        </p>
        <p>
          <Button asChild className="w-fit">
            <Link
              className="cursor-pointer hover:text-orange-500"
              to={user ? '/dashboard/courses' : '/'}
            >
              {user
                ? t('dashboard.goToDashboard')
                : t('dashboard.goToHomepage')}
            </Link>
          </Button>
        </p>
      </div>
    ),
    [ValidationStatus.ERROR]: (
      <div>
        <h1 className="mb-10 text-4xl font-bold lg:text-5xl">
          {t('auth.emailValidation.errorValidatingEmailChange')}
        </h1>
        <p className="my-8 max-w-2xl">
          {t('auth.emailValidation.errorValidatingEmailChangeDescription')}
        </p>
        <p>
          <Button asChild className="w-fit">
            <Link
              className="cursor-pointer hover:text-orange-500"
              to={user ? '/dashboard/courses' : '/'}
            >
              {user
                ? t('dashboard.goToDashboard')
                : t('dashboard.goToHomepage')}
            </Link>
          </Button>
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
}
