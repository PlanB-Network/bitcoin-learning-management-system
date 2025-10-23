import { formatNameForURL } from '@blms/shared';

interface TocItem {
  title: string;
  key: string;
}

const stripFencedCodeBlocks = (md: string) => {
  return md.replace(/```[\s\S]*?```/g, '');
};

const stripInlineMarkdown = (text: string) => {
  if (!text) return text;

  // 1) Remove inline code `code`
  let s = text.replace(/`([^`]+)`/g, '$1');

  // 2) Replace images ![alt](url) with alt text
  s = s.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // 3) Replace links [text](url) -> text
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 4) Reference-style links [text][id] -> text
  s = s.replace(/\[([^\]]+)\]\s*\[[^\]]*\]/g, '$1');

  // 5) Remove emphasis/bold markers (*, _, **, __, ~~)
  s = s.replace(/(\*\*|__)(.*?)\1/g, '$2'); // bold
  s = s.replace(/(\*|_)(.*?)\1/g, '$2'); // italic
  s = s.replace(/~~(.*?)~~/g, '$1'); // strikethrough

  // 6) Remove HTML tags if any
  s = s.replace(/<\/?[^>]+(>|$)/g, '');

  // 7) Trim and collapse whitespace
  return s.replace(/\s+/g, ' ').trim();
};

const extractH2Titles = (rawMd: string) => {
  if (!rawMd) return [];
  const cleaned = stripFencedCodeBlocks(rawMd);
  const regex = /^\s*##\s+(.*)$/gm;
  const titles: string[] = [];
  let match = regex.exec(cleaned);
  while (match !== null) {
    const rawTitle = match[1].trim();
    titles.push(stripInlineMarkdown(rawTitle));
    match = regex.exec(cleaned);
  }
  return titles;
};

export const makeAnchorKey = (title: string) => {
  return formatNameForURL(stripInlineMarkdown(title));
};

export const buildTutorialTocFromMarkdown = (rawMd: string) => {
  const titles = extractH2Titles(rawMd);
  const map = new Map<string, number>();
  const toc: TocItem[] = [];

  titles.forEach((title) => {
    const base = makeAnchorKey(title);
    const count = map.get(base) ?? 0;
    map.set(base, count + 1);
    const key = count === 0 ? base : `${base}-${count}`;
    toc.push({ title, key });
  });

  return toc;
};
