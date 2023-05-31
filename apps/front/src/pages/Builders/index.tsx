import { useState } from 'react';
import { Link } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import { Card } from '../../atoms/Card';
import { RessourceLayout } from '../../components/RessourceLayout';
import { Routes } from '../../types';
import { replaceDynamicParam } from '../../utils';

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
    <RessourceLayout
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
          <Card key={category} className="m-8 bg-gray-200 rounded-3xl">
            <h3 className="w-full px-4 py-1 mb-2 text-xl italic font-semibold uppercase bg-orange-500 rounded-md text-primary-700">
              {category}
            </h3>
            <div className="flex flex-row flex-wrap items-center">
              {filteredBuilders.map((builder, index) => (
                <Link
                  className="mx-2 mb-5 h-fit min-w-[100px] w-20 z-10 hover:z-20 delay-100 hover:delay-0 m-auto group"
                  to={replaceDynamicParam(Routes.Builder, {
                    builderId: builder.id.toString(),
                    language: builder.language,
                  })}
                  key={index}
                >
                  <div className="relative px-2 pt-2 m-auto mb-2 transition duration-500 ease-in-out rounded-t-full h-fit group-hover:scale-125 group-hover:bg-secondary-400">
                    <img
                      className="mx-auto bg-white rounded-full h-30"
                      src={builder.logo}
                      alt={builder.name}
                    />
                    <p className="absolute inset-x-0 w-full px-4 py-2 text-xs font-light text-center text-white transition-colors duration-500 ease-in-out rounded-b-lg h-fit wrap align-center inset-y-end group-hover:bg-secondary-400">
                      <span className="transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100">
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
    </RessourceLayout>
  );
};
