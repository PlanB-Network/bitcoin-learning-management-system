import { useState } from 'react';
import { Link, generatePath } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import { Card } from '../../atoms/Card';
import { ResourceLayout } from '../../components';
import { Routes } from '../../types';

export const Builders = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetching data from the API
  const { data: builders } = trpc.content.getBuilders.useQuery({
    language: 'en',
  });

  // Adding a category to each builder
  const sortedBuilders = builders
    ? builders.sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const categorizedBuilders = sortedBuilders.reduce((acc, builder) => {
    if (!acc[builder.category]) {
      acc[builder.category] = [];
    }
    acc[builder.category].push(builder);
    return acc;
  }, {} as Record<string, typeof sortedBuilders>);

  const categories = [
    ...new Set(sortedBuilders.map((builder) => builder.category)),
  ].sort(
    (a, b) => categorizedBuilders[b].length - categorizedBuilders[a].length
  );

  return (
    <ResourceLayout
      title="The Builders' Portal"
      tagLine="This portal is open-source & open to contribution. Thanks for
    grading and sharing!"
      filterBar={{
        onChange: setSearchTerm,
        label: 'Find the perfect resources for your needs:',
      }}
    >
      {categories.map((category) => {
        const filteredBuilders = categorizedBuilders[category].filter(
          (builder) =>
            builder.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // If no result, do not show an empty card.
        if (filteredBuilders.length === 0) {
          return null;
        }

        return (
          <Card key={category} className="m-8 rounded-3xl bg-gray-200">
            <h3 className="text-primary-700 bg-secondary-500 mb-2 w-full rounded-md px-4 py-1 text-xl font-semibold uppercase italic">
              {category}
            </h3>
            <div className="flex flex-row flex-wrap items-center">
              {filteredBuilders.map((builder, index) => (
                <Link
                  className="group z-10 m-auto mx-2 mb-5 h-fit w-20 min-w-[100px] delay-100 hover:z-20 hover:delay-0"
                  to={generatePath(Routes.Builder, {
                    builderId: builder.id.toString(),
                    language: builder.language,
                  })}
                  key={index}
                >
                  <div className="group-hover:bg-secondary-400 relative m-auto mb-2 h-fit rounded-t-full px-2 pt-2 transition duration-500 ease-in-out group-hover:scale-125">
                    <img
                      className="mx-auto h-32 rounded-full bg-white"
                      src={builder.logo}
                      alt={builder.name}
                    />
                    <p className="inset-y-end group-hover:bg-secondary-400 font-thin absolute inset-x-0 h-fit w-full flex-wrap items-center rounded-b-lg px-4 py-2 text-center text-xs text-white transition-colors duration-500 ease-in-out">
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
