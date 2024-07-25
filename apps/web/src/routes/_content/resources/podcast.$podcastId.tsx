import { createFileRoute, useParams } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@blms/ui';

import Spinner from '#src/assets/spinner_orange.svg?react';
import { Card } from '#src/atoms/Card/index.js';
import { useGreater } from '#src/hooks/use-greater.js';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.js';
import { trpc } from '#src/utils/trpc.js';

import { ResourceLayout } from './-other/layout.tsx';

export const Route = createFileRoute('/_content/resources/podcast/$podcastId')({
  component: Podcast,
});

function Podcast() {
  const { navigateTo404 } = useNavigateMisc();
  const { t, i18n } = useTranslation();
  const { podcastId } = useParams({
    from: '/resources/podcast/$podcastId',
  });
  const { data: podcast, isFetched } = trpc.content.getPodcast.useQuery({
    id: Number(podcastId),
    language: i18n.language ?? 'en',
  });
  const isScreenMd = useGreater('sm');
  const navigateTo404Called = useRef(false);

  useEffect(() => {
    if (!podcast && isFetched && !navigateTo404Called.current) {
      navigateTo404();
      navigateTo404Called.current = true;
    }
  }, [podcast, isFetched, navigateTo404]);

  function displayAbstract() {
    return (
      <div className="mt-6 border-l-4 border-blue-600 pl-4">
        <h3 className="mb-4 text-lg font-semibold text-blue-900">
          {t('podcast.abstract')}
        </h3>
        <p className="mb-4 line-clamp-[20] max-w-2xl text-ellipsis whitespace-pre-line pr-4 text-justify text-sm md:pr-8">
          {podcast?.description}
        </p>
      </div>
    );
  }

  return (
    <ResourceLayout
      title={t('podcasts.pageTitle')}
      tagLine={t('podcasts.pageSubtitle')}
      link={'/resources/podcasts'}
      activeCategory="podcasts"
      backToCategoryButton
    >
      {!isFetched && <Spinner className="size-24 md:size-32 mx-auto" />}
      {podcast && (
        <div className="w-full">
          <Card className="mx-2 md:mx-auto">
            <div className="my-4 w-full grid-cols-1 grid-rows-1 sm:grid-cols-3 md:grid">
              <div className="flex flex-col items-center justify-center border-b-4 border-blue-800 md:mr-10 md:border-0">
                <img
                  className="max-h-72 sm:max-h-96"
                  alt={t('imagesAlt.bookCover')}
                  src={podcast.logo}
                />
                <div className="my-4 flex flex-row justify-evenly md:flex-col md:space-y-2 lg:flex-row lg:space-y-0">
                  {podcast?.podcastUrl && (
                    <a href={podcast.podcastUrl}>
                      <Button
                        size={isScreenMd ? 's' : 'xs'}
                        variant="tertiary"
                        className="mx-2"
                      >
                        {t('podcast.discover')}
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              <div className="col-span-2 my-4 flex flex-col md:mt-0">
                <div>
                  <h2 className="mb-2 max-w-lg text-2xl font-bold text-blue-800 sm:text-4xl">
                    {podcast?.name}
                  </h2>

                  <div className="mt-2 text-sm">
                    <h5 className="font-light italic">
                      {podcast.host}, {podcast.lastUpdated.toString()}.
                    </h5>
                  </div>
                </div>

                <div className="mt-2 text-blue-700">
                  <span className="text-xs font-light italic">
                    {t('book.topicsAddressed')}
                  </span>
                  {podcast?.tags.map((object, i) => (
                    <span key={i}>
                      {i > 0 && ', '}
                      {object.toUpperCase()}
                    </span>
                  ))}
                </div>
                {isScreenMd && displayAbstract()}
              </div>
            </div>
            {!isScreenMd && displayAbstract()}
          </Card>
        </div>
      )}
    </ResourceLayout>
  );
}
