import { useTranslation } from 'react-i18next';

import { trpc } from '#src/utils/trpc.js';

export const useSuggestedContent = (contentType: 'podcasts' | 'books') => {
  const { i18n } = useTranslation();

  if (contentType === 'podcasts') {
    const { data, isFetched } = trpc.content.getPodcasts.useQuery({
      language: i18n.language ?? 'en',
    });
    return { data, isFetched };
  } else if (contentType === 'books') {
    const { data, isFetched } = trpc.content.getBooks.useQuery({
      language: i18n.language ?? 'en',
    });
    return { data, isFetched };
  }

  return { data: null, isFetched: false };
};
