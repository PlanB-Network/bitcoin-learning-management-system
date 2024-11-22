import { Link, createFileRoute } from '@tanstack/react-router';
import { capitalize } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { Loader } from '@blms/ui';

import { assetUrl } from '#src/utils/index.ts';
import { formatNameForURL } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.js';

import { BuilderCard } from '../-components/cards/builder-card.tsx';
import { ResourceLayout } from '../-components/resource-layout.tsx';

export const Route = createFileRoute('/_content/resources/builders/')({
  component: Builders,
});

function Builders() {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: builders, isFetched } = trpc.content.getBuilders.useQuery(
    {
      language: i18n.language ?? 'en',
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  const sortedBuilders = builders
    ? builders.sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const categorizedBuilders = {} as Record<string, typeof sortedBuilders>;
  for (const builder of sortedBuilders) {
    if (!categorizedBuilders[builder.category]) {
      categorizedBuilders[builder.category] = [];
    }
    categorizedBuilders[builder.category].push(builder);
  }

  const categories = [
    ...new Set(sortedBuilders.map((builder) => builder.category)),
  ].sort(
    (a, b) => categorizedBuilders[b].length - categorizedBuilders[a].length,
  );

  return (
    <ResourceLayout
      title={t('builders.pageTitle')}
      tagLine={t('builders.pageSubtitle')}
      filterBar={{
        onChange: setSearchTerm,
      }}
      activeCategory="builders"
    >
      {!isFetched && <Loader size={'s'} />}
      <div className="flex flex-col gap-5 p-4 pt-0 md:p-10 md:pt-0">
        {categories.map((category) => {
          const filteredBuilders = categorizedBuilders[category].filter(
            (builder) =>
              builder.name.toLowerCase().includes(searchTerm.toLowerCase()),
          );

          if (filteredBuilders.length === 0) {
            return null;
          }

          return (
            <details key={category} className="group">
              <summary className="border-b border-newGray-1 [&::-webkit-details-marker]:hidden list-none">
                <h3 className="text-white group-open:font-semibold md:text-2xl flex items-center gap-5">
                  {capitalize(category)}
                  <MdKeyboardArrowDown
                    size={24}
                    className="group-open:-rotate-180 transition-transform ease-in-out"
                  />
                </h3>
              </summary>
              <div className="mt-5 flex flex-row flex-wrap justify-center items-center gap-4 md:gap-11">
                {filteredBuilders.map((builder) => (
                  <Link
                    to={`/resources/builders/${formatNameForURL(builder.name)}-${builder.id}`}
                    params={{
                      builderId: builder.id.toString(),
                    }}
                    key={builder.id}
                  >
                    <BuilderCard
                      name={builder.name}
                      logo={assetUrl(builder.path, 'logo.webp')}
                    />
                  </Link>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </ResourceLayout>
  );
}
