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
  return s.replace(/^\D+/g, '');
}
