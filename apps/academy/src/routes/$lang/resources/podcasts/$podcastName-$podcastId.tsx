import { formatNameForURL } from '@blms/shared';
import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { PageLayout } from '#src/components/page-layout.tsx';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.ts';
import { getNameAndIdFromUrl } from '#src/services/utils.tsx';
import { resourceImgUrl, trpc } from '#src/utils/index.ts';
import { useShuffleSuggestedContent } from '#src/utils/resources-hook.ts';
import { ResourceDetails } from '../-components/resource-details.tsx';

export const Route = createFileRoute(
  '/$lang/resources/podcasts/$podcastName-$podcastId',
)({
  component: Podcast,
  params: {
    parse: (params) => {
      const podcastNameId = params['podcastName-$podcastId'];
      const { id, name } = getNameAndIdFromUrl(podcastNameId);

      return {
        lang: z.string().parse(params.lang),
        podcastId: z.string().parse(id),
        podcastName: z.string().parse(name),
        'podcastName-$podcastId': `${name}-${id}`,
      };
    },
    stringify: ({ lang, podcastName, podcastId }) => ({
      lang: lang,
      'podcastName-$podcastId': `${podcastName}-${podcastId}`,
    }),
  },
});

function Podcast() {
  const navigate = useNavigate();
  const { navigateTo404 } = useNavigateMisc();
  const { t, i18n } = useTranslation();
  const params = Route.useParams();

  const { data: podcast, isFetched } = useQuery(
    trpc.content.getPodcast.queryOptions({
      id: params.podcastId,
      language: i18n.language ?? 'en',
    }),
  );

  const { data: suggestedPodcasts, isFetched: isFetchedSuggested } = useQuery(
    trpc.content.getPodcasts.queryOptions({}),
  );

  useEffect(() => {
    if (podcast && params.podcastName !== formatNameForURL(podcast.name)) {
      navigate({
        replace: true,
        to: `/resources/podcasts/${formatNameForURL(podcast.name)}-${podcast.id}`,
      });
    }
  }, [podcast, isFetched, navigateTo404, navigate, params.podcastName]);

  const shuffledSuggestedPodcasts = useShuffleSuggestedContent(
    suggestedPodcasts ?? [],
    podcast,
  );

  return (
    <PageLayout
      backLink={{
        href: '/resources/podcasts',
        text: t('resources.podcasts.title'),
      }}
      layoutSize="wide"
      title={podcast?.name ?? undefined}
      hideTitle
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !podcast && (
        <div>
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.podcast'),
          })}
        </div>
      )}
      {podcast && (
        <ResourceDetails
          title={podcast.name}
          subtitle={`${podcast.host}`}
          language={podcast.language}
          button={
            podcast.podcastUrl
              ? {
                  href: podcast.podcastUrl,
                  label: t('resources.podcasts.checkThePodcast'),
                }
              : undefined
          }
          tags={podcast.tags}
          imgSrc={resourceImgUrl(podcast, 'logo.webp')}
          abstract={podcast.description || ''}
          suggestedHeaderText={'resources.pageSubtitlePodcast'}
          suggestedResources={
            isFetchedSuggested
              ? shuffledSuggestedPodcasts.map((suggestedPodcast) => {
                  const isPodcast = 'name' in suggestedPodcast;
                  return {
                    title: isPodcast ? suggestedPodcast.name || '' : '',
                    href: isPodcast
                      ? `/resources/podcasts/${suggestedPodcast.id}`
                      : '',
                    imgSrc: isPodcast
                      ? resourceImgUrl(suggestedPodcast, 'logo.webp')
                      : '',
                  };
                })
              : undefined
          }
        />
      )}
    </PageLayout>
  );
}
