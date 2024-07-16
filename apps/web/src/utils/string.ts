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

export const capitalizeFirstWord = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const normalizeString = (str: string) => {
  return str
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036F]/g, '')
    .toLowerCase();
};

export const formatNameForURL = (name: string): string => {
  return name.toLowerCase().replaceAll(/\s+/g, '-');
};
