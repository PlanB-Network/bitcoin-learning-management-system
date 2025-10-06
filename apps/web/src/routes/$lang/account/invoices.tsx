import { UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared';
import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.tsx';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';
import { BillingSection } from './-components/billing-section.tsx';

export const Route = createFileRoute('/$lang/account/invoices')({
  component: Invoices,
});

function Invoices() {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const { session, user } = useContext(AppContext);

  const { data: invoices } = useQuery(
    trpc.user.billing.getInvoices.queryOptions({
      language: i18n.language ?? 'en',
    }),
  );

  useEffect(() => {
    if (session === null) {
      navigate({ to: '/' });
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  return (
    <PageLayout
      layoutSize="wide"
      title={t('words.invoices')}
      tabs={[
        { id: 'account', label: t('words.account'), href: '/account' },
        ...(user?.professorId && canAccess(UserRole.Professor)(user)
          ? [
              {
                id: 'teacher-profile',
                label: t('account.myTeacherProfile'),
                href: '/account/teacher-profile',
              },
            ]
          : []),
        {
          id: 'settings',
          label: t('words.settings'),
          href: '/account/settings',
        },
        {
          id: 'invoices',
          label: t('words.invoices'),
          href: '/account/invoices',
        },
      ]}
    >
      {invoices && <BillingSection invoices={invoices} />}
    </PageLayout>
  );
}
