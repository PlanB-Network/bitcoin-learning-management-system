import { EmptyState } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import { TbError404 } from 'react-icons/tb';
import { z } from 'zod';
import { LegalMarkdownBody } from '#src/components/Markdown/legal-markdown-body.tsx';
import { PageLayout } from '#src/components/page-layout.tsx';
import { trpc } from '#src/utils/trpc.js';

export const Route = createFileRoute('/$lang/_misc/legal/$name')({
  component: LegalInformationTab,
  params: {
    parse: (params) => ({
      lang: z.string().parse(params.lang),
      name: z.string().parse(params.name),
    }),
    stringify: ({ lang, name }) => ({
      lang: `${lang}`,
      name: `${name}`,
    }),
  },
});

const legalTabs = [
  {
    href: '/legal/contact',
    id: 'contact',
    label: 'publicCommunication.legalSections.contact',
  },
  {
    href: '/legal/legal-notice',
    id: 'legal-notice',
    label: 'publicCommunication.legalSections.legalNotice',
  },
  {
    href: '/legal/privacy-policy',
    id: 'privacy-policy',
    label: 'publicCommunication.legalSections.privacyPolicy',
  },
  {
    href: '/legal/terms-of-sale',
    id: 'terms-of-sale',
    label: 'publicCommunication.legalSections.termsOfSale',
  },
];

function LegalInformationTab() {
  const { i18n } = useTranslation();
  const params = Route.useParams();
  const name = params.name;
  const activeTabLabelKey = legalTabs.find((tab) => tab.id === name)?.label;

  const { data: legal, isFetched } = useQuery(
    trpc.content.getLegal.queryOptions({
      language: i18n.language,
      name,
    }),
  );

  return (
    <PageLayout
      title={activeTabLabelKey ? t(activeTabLabelKey) : ''}
      tabs={legalTabs}
      layoutSize="base"
    >
      {isFetched && !legal ? (
        <EmptyState
          title={t('publicCommunication.legalSections.notFound')}
          icon={TbError404}
        />
      ) : (
        <LegalMarkdownBody content={legal?.rawContent} />
      )}
    </PageLayout>
  );
}
