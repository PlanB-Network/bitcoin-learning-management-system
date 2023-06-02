import { Popover, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';

import { trpc } from '@sovereign-academy/api-client';

import { ResourceLayout } from '../../components';

export const Podcasts = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: podcasts } = trpc.content.getPodcasts.useQuery({
    language: 'en',
  });

  return (
    <ResourceLayout
      title="The Podcast Portal"
      tagLine="This PORTAL is open-source & open to contribution. Thanks for grading and sharing !"
      filterBar={{
        onChange: setSearchTerm,
        label: 'Find the perfect resources for your needs:',
      }}
    >
      <div className="my-20 grid grid-cols-2 gap-x-8 gap-y-16 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {podcasts
          ?.filter(({ name }) => name.includes(searchTerm))
          .map((podcast) => (
            <Popover key={podcast.logo} className="relative">
              <Popover.Button>
                <div
                  className="group max-h-64 cursor-pointer"
                  key={podcast.logo}
                >
                  <img
                    className="group-hover:border-secondary-400 mx-auto h-full rounded-none border-2 border-solid border-transparent duration-200 group-hover:rounded-3xl"
                    src={podcast.logo}
                    alt={podcast.name}
                  />
                </div>
              </Popover.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="bg-primary-100 absolute z-10">
                  <div className="bg-secondary-400 flex w-52 flex-col p-2">
                    <img
                      className="group-hover:border-secondary-400 mx-auto h-full rounded-none border-2 border-solid border-transparent duration-200 group-hover:rounded-3xl"
                      src={podcast.logo}
                      alt={podcast.name}
                    />

                    <h4 className="text-xs">{podcast.name}</h4>
                    <h5 className="text-xxs italic">{podcast.host}</h5>
                    <h5 className="text-xxs italic">
                      {podcast.tags.join(', ')}
                    </h5>
                  </div>
                </Popover.Panel>
              </Transition>
            </Popover>
          ))}
      </div>
    </ResourceLayout>
  );
};
