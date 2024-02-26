import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Card } from '../../../atoms/Card/index.tsx';
import { trpc } from '../../../utils/index.ts';
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
    >
      {categories.map((category) => {
        const filteredBuilders = categorizedBuilders[category].filter(
          (builder) =>
            builder.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );

        if (filteredBuilders.length === 0) {
          return null;
        }

        return (
          <Card key={category} className="mx-2 mb-8 rounded-3xl bg-gray-200 ">
            <h3 className="mb-2 w-full rounded-md px-4 py-1 text-xl font-semibold uppercase italic text-blue-700">
              {category}
            </h3>
            <div className="flex flex-row flex-wrap items-center">
              {filteredBuilders.map((builder, index) => (
                <Link
                  className="group z-10 m-auto mx-2 mb-5 h-fit w-20 delay-100 hover:z-20 hover:delay-0"
                  to={'/resources/builder/$builderId'}
                  params={{
                    builderId: builder.id.toString(),
                  }}
                  key={index}
                >
                  <div className="relative m-auto mb-2 h-fit rounded-t-full px-2 pt-2 transition duration-500 ease-in-out group-hover:scale-125 group-hover:bg-orange-400">
                    <img
                      className="mx-auto w-20 rounded-full bg-white"
                      src={builder.logo}
                      alt={builder.name}
                    />
                    <p className="absolute inset-x-0 h-fit w-full flex-wrap items-center rounded-b-lg px-4 py-2 text-center text-xs font-light text-white transition-colors duration-500 ease-in-out group-hover:bg-orange-400">
                      <span className="opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100">
                        {builder.name}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        );
      })}
    </ResourceLayout>
  );
};
