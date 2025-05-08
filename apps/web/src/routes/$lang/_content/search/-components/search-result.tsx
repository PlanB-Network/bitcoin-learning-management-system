import type { SearchResultItem } from '@blms/types';
import type { Searchable } from '@blms/types';
import { Tag } from '@blms/ui';
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
      className="block rounded-lg p-2 hover:bg-maroon-10 border border-transparent focus:border-newOrange-1 focus:outline-none"
      href={`${item.document.link}#:~:text=${item.highlight.body?.matched_tokens?.[0] ?? item.document.title}`}
      target="_blank"
      rel="noreferrer"
    >
      <div className="flex gap-4 items-center">
        <Tag className="bg-maroon-9 text-base border-0 p-2 py-1 text-white font-thin">
          {t(`search.${item.document.type}`)}
        </Tag>

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
