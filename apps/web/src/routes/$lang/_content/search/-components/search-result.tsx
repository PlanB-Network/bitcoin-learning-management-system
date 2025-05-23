import type { SearchResultItem } from '@blms/types';
import type { Searchable } from '@blms/types';
import { TextTag } from '@blms/ui';
import { default as DOMPurify } from 'dompurify';

import { useTranslation } from 'react-i18next';

interface SearchResultProps {
  item: SearchResultItem<Searchable>;
  index: number;
}

export const SearchResult = ({ item, index }: SearchResultProps) => {
  const { t } = useTranslation();

  return (
    <a
      className="block rounded-lg p-2 hover:bg-maroon-10 border border-transparent focus:border-newOrange-1 focus:outline-hidden"
      href={`${item.document.link}#:~:text=${item.highlight.body?.matched_tokens?.[0] ?? item.document.title}`}
      target="_blank"
      rel="noreferrer"
    >
      <div className="flex gap-4 items-center">
        <TextTag mode="dark" variant="darkMaroon">
          {t(`search.${item.document.type}`)}
        </TextTag>

        {item.highlight.title ? (
          <div
            className="font-semibold text-lg"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: html is sanitized
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(item.highlight.title?.snippet ?? ''),
            }}
          />
        ) : (
          <div className="font-semibold">{item.document.title}</div>
        )}
      </div>

      {item.highlight.body && (
        <div
          className="ps-2 pt-2 text-newGray-4 font-normal"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: html is sanitized
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(item.highlight.body?.snippet ?? ''),
          }}
        />
      )}
    </a>
  );
};
