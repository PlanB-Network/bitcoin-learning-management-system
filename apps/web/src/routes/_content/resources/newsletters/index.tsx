import { Link, createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Loader } from '@blms/ui';

import { assetUrl } from '#src/utils/index.js';
import { formatNameForURL } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.js';

import { ResourceCard } from '../-components/cards/resource-card.js';
import { ResourceLayout } from '../-components/resource-layout.js';

export const Route = createFileRoute('/_content/resources/newsletters/')({
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
      newsletter.title?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) ?? [];
  return (
    <ResourceLayout
      title={t('resources.newsletters.title')}
      tagLine={t('conferences.pageSubtitle')}
      activeCategory="newsletters"
      filterBar={{
        onChange: setSearchTerm,
        label: t('resources.filterBarLabel'),
      }}
    >
      <div className="flex flex-wrap md:justify-center gap-4 md:gap-10 mt-6 md:mt-12 mx-auto">
        {!isFetched && <Loader size={'s'} />}
        {filteredNewsletters.map((newsletter) => (
          <Link
            to={`/resources/newsletters/${formatNameForURL(newsletter.title)}-${newsletter.resourceId}`}
            key={`${newsletter.resourceId}`}
            params={{
              newsletterId: newsletter?.resourceId.toString(),
            }}
            className="grow md:grow-0"
          >
            <ResourceCard
              name={newsletter.title}
              author={newsletter.author}
              imageSrc={assetUrl(newsletter.path, 'thumbnail.webp')}
            />
          </Link>
        ))}
      </div>
    </ResourceLayout>
  );
}
