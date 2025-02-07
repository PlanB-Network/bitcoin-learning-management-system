export const joinWords = (words: string[]) => {
  if (words.length === 0) {
    return '';
  }

  if (words.length === 1) {
    return words[0];
  }

  const lastWord = words.pop();

  return `${words.join(', ')} & ${lastWord}`;
};

export function extractNumbers(s: string) {
  return s.replaceAll(/^\D+/g, '');
}

export const toCamelCase = (str: string) => {
  return str
    .split(' ')
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join('');
};

export const capitalizeFirstWord = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const normalizeString = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\p{M}]/gu, '')
    .toLowerCase();
};

export const formatNameForURL = (name: string): string => {
  return name.toLowerCase().replaceAll(/\s+/g, '-').replaceAll('.', '-');
};
