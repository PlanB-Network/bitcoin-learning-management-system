import { cn, EmptyState } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { TbError404 } from 'react-icons/tb';
import { z } from 'zod';
import PageBlock from '#src/components/page-block.tsx';
import { trpc } from '#src/utils/trpc.js';
import { LegalMarkdownComponent } from './-components/legal-markdown.tsx';
import { legalTabs } from './-components/legal-utils.tsx';

export const Route = createFileRoute('/legal/$name')({
  component: LegalInformationTab,
  params: {
    parse: (params) => ({
      name: z.string().parse(params.name),
    }),
    stringify: ({ name }) => ({
      name: `${name}`,
    }),
  },
});

function LegalInformationTab() {
  const { t } = useTranslation();
  const params = Route.useParams();
  const name = params.name;

  const { data: legal, isFetched } = useQuery(
    trpc.content.getLegal.queryOptions({
      language: 'en',
      name,
    }),
  );

  return (
    <div>
      {isFetched && !legal ? (
        <EmptyState
          title={t('publicCommunication.legalSections.notFound')}
          icon={TbError404}
        />
      ) : (
        <PageBlock>
          <div className="flex flex-row title-small lg:title-large gap-6 mb-12">
            {legalTabs.map((tab) => (
              <Link
                key={tab.id}
                to={`/legal/${tab.id}`}
                className={cn(name === tab.id && 'text-orange-500')}
              >
                {t(tab.label)}
              </Link>
            ))}
          </div>
          <LegalMarkdownComponent content={legal?.rawContent} />
        </PageBlock>
      )}
    </div>
  );
}
