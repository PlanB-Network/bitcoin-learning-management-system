import { createFileRoute, redirect } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import Layout from './-layout.tsx';

export const Route = createFileRoute('/_content/_misc/public-communication/')({
  loader: () => {
    return redirect({
      to: '/public-communication/blogs-and-news',
      throw: false,
    });
  },
  component: PublicCommunicationPage,
});

function PublicCommunicationPage() {
  const { t } = useTranslation();

  return (
    <Layout t={t}>
      <div className="max-w-[280px] mx-auto"></div>
    </Layout>
  );
}
