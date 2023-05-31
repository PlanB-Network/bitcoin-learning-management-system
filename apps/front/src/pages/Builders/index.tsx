import { useState } from 'react';
import { Link } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import { Card } from '../../atoms/Card';
import { MainLayout } from '../../components';
import { PageTitle } from '../../components/PageTitle';
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
    <MainLayout>
      <div className="bg-primary-900 w-full min-h-screen h-fit  p-[3em] space-y-10">
        <div className="">
          <PageTitle>The Builders' Portal</PageTitle>
          <p className="text-justify mx-8 pb-3 text-white">
            This portal is open-source & open to contribution. Thanks for
            grading and sharing!
          </p>
        </div>
        <div className="flex flex-row justify-between items-center bg-white mx-8 px-6 py-2 rounded-full text-xs">
          <div className="grow">
            <p className="text-primary-700 mb-1">
              Find the perfect resources for your needs:
            </p>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-2/3 h-fit text-sm bg-gray-100 rounded-full inline-block py-1 placeholder-gray-500 placeholder-opacity-50 border-0 focus:outline-none focus:ring focus:ring-gray-300 focus:border-gray-100 dark:bg-gray-700 focus:black dark:black dark:border-gray-600 dark:focus:ring-gray-900 dark:focus:border-gray-500"
            />
          </div>
          <button className="text-justify italic font-thin underline">
            Additional criteria
          </button>
        </div>
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
            <Card key={category} className="bg-gray-200 m-8 rounded-3xl">
              <h3 className="font-semibold uppercase italic text-xl mb-2 py-1 px-4 rounded-md bg-orange-500 text-primary-700 w-full">
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
                    <div className="relative px-2 pt-2 mb-2 h-fit m-auto rounded-t-full group-hover:scale-125 group-hover:bg-secondary-400 transition duration-500 ease-in-out">
                      <img
                        className="rounded-full bg-white h-30 mx-auto"
                        src={builder.logo}
                        alt={builder.name}
                      />
                      <p className="w-full h-fit absolute wrap align-center rounded-b-lg inset-x-0 inset-y-end px-4 py-2 font-light text-xs text-white group-hover:bg-secondary-400 transition-colors duration-500 ease-in-out text-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out">
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
      </div>
    </MainLayout>
  );
};
