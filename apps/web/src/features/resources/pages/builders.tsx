import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { trpc } from '../../../utils/index.ts';
import { capitalizeFirstWord } from '../../../utils/string.ts';
import { BuilderCard } from '../components/Cards/builder-card.tsx';
import { ResourceLayout } from '../layout.tsx';

export const Builders = () => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: builders } = trpc.content.getBuilders.useQuery({
    language: i18n.language ?? 'en',
  });

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
        label: t('resources.filterBarLabel'),
      }}
      categoryActive="builders"
    >
      <div className="flex flex-col gap-5 p-4 md:p-10">
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
                  {capitalizeFirstWord(category)}
                  <MdKeyboardArrowDown
                    size={24}
                    className="group-open:-rotate-180 transition-transform ease-in-out"
                  />
                </h3>
              </summary>
              <div className="mt-5 flex flex-row flex-wrap justify-center items-center gap-4 md:gap-11">
                {filteredBuilders.map((builder) => (
                  <Link
                    to={'/resources/builder/$builderId'}
                    params={{
                      builderId: builder.id.toString(),
                    }}
                    key={builder.id}
                  >
                    <BuilderCard name={builder.name} logo={builder.logo} />
                  </Link>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </ResourceLayout>
  );
};
