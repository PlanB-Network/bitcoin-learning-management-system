import { Link, createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Loader } from '@blms/ui';

import { trpc } from '#src/utils/trpc.js';

import { ResourceCard } from '../-components/cards/resource-card.tsx';
import { ResourceLayout } from '../-components/resource-layout.tsx';

export const Route = createFileRoute('/_content/resources/newsletter/')({
  component: Newsletter,
});

function Newsletter() {
  const [searchTerm, setSearchTerm] = useState('');
  const { t, i18n } = useTranslation();
  const { data: newsletters, isFetched } = trpc.content.getNewsletters.useQuery(
    {
      language: i18n.language,
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  const filteredNewsletters =
    newsletters?.filter((newsletter) =>
      newsletter.title.toLowerCase().includes(searchTerm.toLowerCase()),
    ) ?? [];
  return (
    <ResourceLayout
      title={t('resources.newsletter.title')}
      tagLine={t('conferences.pageSubtitle')}
      activeCategory="newsletter"
      filterBar={{
        onChange: setSearchTerm,
        label: t('resources.filterBarLabel'),
      }}
    >
      <div className="flex flex-wrap md:justify-center gap-4 md:gap-10 mt-6 md:mt-12 mx-auto">
        {!isFetched && <Loader size={'s'} />}
        {filteredNewsletters.map((newsletter) => (
          <Link
            to={'/resources/newsletter/$newsletterId'}
            params={{
              newsletterId: newsletter.newsletterId.toString(),
            }}
            key={newsletter.id}
            className="grow md:grow-0 shrink-0"
          >
            <ResourceCard
              name={newsletter.title}
              author={newsletter.author}
              imageSrc={newsletter.thumbnail}
            />
          </Link>
        ))}
      </div>
    </ResourceLayout>
  );
}
