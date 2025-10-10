import { EmptyState } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import { TbError404 } from 'react-icons/tb';
import { z } from 'zod';
import { PageLayout } from '#src/components/page-layout.tsx';
import { trpc } from '#src/utils/trpc.js';
import { LegalMarkdownComponent } from '../-components/public-communication/legal-markdown.tsx';
import { legalTabs } from '../-components/utils/public-communication-utils.tsx';

export const Route = createFileRoute('/$lang/_content/_misc/legals/$name')({
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
    >
      {isFetched && !legal ? (
        <EmptyState
          title={t('publicCommunication.legalSections.notFound')}
          icon={TbError404}
        />
      ) : (
        <LegalMarkdownComponent content={legal?.rawContent} />
      )}
    </PageLayout>
  );
}
