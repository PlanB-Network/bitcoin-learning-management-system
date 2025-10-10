import type { Searchable, SearchResultItem } from '@blms/types';
import { TextTag } from '@blms/ui';
import { default as DOMPurify } from 'dompurify';
import { useTranslation } from 'react-i18next';
import { useSmaller } from '#src/hooks/use-smaller.ts';

interface SearchResultProps {
  item: SearchResultItem<Searchable>;
  index: number;
}

export const SearchResult = ({ item }: SearchResultProps) => {
  const isMobile = useSmaller('md');
  const { t } = useTranslation();

  return (
    <a
      className="flex flex-col gap-1 md:gap-2 rounded-2xl px-0.5 py-1 md:px-4 md:py-3 hover:bg-neutral-50 border border-transparent focus:border-orange-500 focus:outline-hidden search-results"
      href={`${item.document.link}#:~:text=${item.highlight.body?.matched_tokens?.[0] ?? item.document.title}`}
      target="_blank"
      rel="noreferrer"
    >
      <div className="flex gap-2.5 items-center">
        <TextTag mode="light" variant="grey" size={isMobile ? 'small' : 'base'}>
          {t(`search.${item.document.type}`)}
        </TextTag>

        {item.highlight.title ? (
          <div
            className="body-base md:label"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: html is sanitized
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(item.highlight.title?.snippet ?? ''),
            }}
          />
        ) : (
          <div className="body-base md:label">{item.document.title}</div>
        )}
      </div>

      {item.highlight.body && (
        <div
          className="text-neutral-600 body-extra-small md:body-small"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: html is sanitized
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(item.highlight.body?.snippet ?? ''),
          }}
        />
      )}
    </a>
  );
};
