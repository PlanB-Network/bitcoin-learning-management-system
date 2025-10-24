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
  '/$lang/_content/resources/channels/$channelName-$channelId',
)({
  component: Channel,
  params: {
    parse: (params) => {
      const channelNameId = params['channelName-$channelId'];
      const { id, name } = getNameAndIdFromUrl(channelNameId);

      return {
        channelId: z.string().parse(id),
        channelName: z.string().parse(name),
        'channelName-$channelId': `${name}-${id}`,
        lang: z.string().parse(params.lang),
      };
    },
    stringify: ({ lang, channelName, channelId }) => ({
      'channelName-$channelId': `${channelName}-${channelId}`,
      lang: lang,
    }),
  },
});

function Channel() {
  const navigate = useNavigate();
  const { navigateTo404 } = useNavigateMisc();
  const { t, i18n } = useTranslation();
  const params = Route.useParams();

  const { data: channel, isFetched } = useQuery(
    trpc.content.getYoutubeChannel.queryOptions({
      id: params.channelId,
      language: i18n.language ?? 'en',
    }),
  );

  const { data: suggestedChannels, isFetched: isFetchedSuggested } = useQuery(
    trpc.content.getYoutubeChannels.queryOptions({}),
  );

  useEffect(() => {
    if (channel && params.channelName !== formatNameForURL(channel.name)) {
      navigate({
        replace: true,
        to: `/resources/channels/${formatNameForURL(channel.name)}-${channel.id}`,
      });
    }
  }, [channel, isFetched, navigateTo404, navigate, params.channelName]);

  const shuffledSuggestedChannels = useShuffleSuggestedContent(
    suggestedChannels ?? [],
    channel,
  );

  return (
    <PageLayout
      backLink={{
        href: '/resources/channels',
        text: t('resources.channels.title'),
      }}
      layoutSize="wide"
      title={channel?.name ?? undefined}
      hideTitle
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !channel && (
        <div>
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.channel'),
          })}
        </div>
      )}
      {channel && (
        <ResourceDetails
          title={channel.name}
          imgSrc={resourceImgUrl(channel)}
          language={channel.language}
          button={{ label: t('youtubeChannels.view'), href: channel.channel }}
          tags={channel.tags?.filter(
            (tag) => tag && tag.toLowerCase() !== 'null',
          )}
          abstract={channel.description || ''}
          trailer={channel.trailer}
          suggestedHeaderText={'resources.pageSubtitleChannels'}
          suggestedResources={
            isFetchedSuggested
              ? shuffledSuggestedChannels
                  .slice(0, 10)
                  .map((suggestedChannel) => {
                    const isChannel = 'name' in suggestedChannel;
                    return {
                      title: isChannel ? suggestedChannel.name || '' : '',
                      imgSrc: resourceImgUrl(suggestedChannel),
                      href: isChannel
                        ? `/resources/channels/${formatNameForURL(suggestedChannel.name ?? '')}-${suggestedChannel.id}`
                        : '',
                    };
                  })
              : []
          }
        />
      )}
    </PageLayout>
  );
}
