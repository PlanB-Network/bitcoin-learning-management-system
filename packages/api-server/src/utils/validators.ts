import * as bip39 from 'bip39';
import { z } from 'zod';

export const contributorIdSchema = z.string().refine(
  (id) => {
    const parts = id.split('-');
    console.log(
      `valid:`,
      parts.length === 2 &&
        parts.every((part) => bip39.wordlists['english'].includes(part))
    );
    return (
      parts.length === 2 &&
      parts.every((part) => bip39.wordlists['english'].includes(part))
    );
  },
  {
    message:
      "Contributor ID must be in the format 'word1-word2' where both words are from the BIP39 English wordlist",
  }
);
