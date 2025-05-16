import { useTranslation } from 'react-i18next';

import type {
  JoinedBook,
  JoinedEvent,
  JoinedMovie,
  JoinedNewsletter,
  JoinedPodcast,
  JoinedYoutubeChannel,
} from '@blms/types';

type Content =
  | JoinedBook
  | JoinedNewsletter
  | JoinedPodcast
  | JoinedYoutubeChannel
  | JoinedEvent
  | JoinedMovie;

export const useShuffleSuggestedContent = (
  suggestedContentArray: Content[],
  currentContent?: Content,
) => {
  const { i18n } = useTranslation();

  if (suggestedContentArray.length === 0 || !currentContent) return [];

  // Filter out the current content from the suggestions
  const filteredContent = suggestedContentArray.filter(
    (suggestedContent) => suggestedContent.id !== currentContent.id,
  );

  // Categorize content into prioritized and others
  const categorizedContent = filteredContent.reduce(
    (acc: { prioritized: Content[]; others: Content[] }, suggestedContent) => {
      if (
        ('language' in suggestedContent &&
          'language' in currentContent &&
          (suggestedContent.language === currentContent.language ||
            suggestedContent.language === i18n.language)) ||
        ('languages' in suggestedContent &&
          'languages' in currentContent &&
          (suggestedContent.languages[0] === currentContent.languages[0] ||
            suggestedContent.languages[0] === i18n.language))
      ) {
        acc.prioritized.push(suggestedContent);
      } else {
        acc.others.push(suggestedContent);
      }
      return acc;
    },
    { prioritized: [], others: [] },
  );

  // Shuffle and combine prioritized and others
  return [
    ...categorizedContent.prioritized.sort(() => Math.random() - 0.5),
    ...categorizedContent.others.sort(() => Math.random() - 0.5),
  ];
};
