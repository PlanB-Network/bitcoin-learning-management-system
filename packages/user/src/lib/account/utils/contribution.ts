import * as bip39 from 'bip39';

import type { PostgresClient } from '@sovereign-university/database';

import { anyContributorIdExistsQuery } from '../queries/index.js';

/**
 * Generates a random word from the BIP39 English wordlist.
 *
 * @returns A random word from the BIP39 English wordlist.
 */
export const getRandomWord = () => {
  const index = Math.floor(Math.random() * 2048);
  return bip39.wordlists['english'][index];
};

/**
 * Generates a random contributor ID in the format 'word1-word2',
 * where both words are from the BIP39 English wordlist.
 *
 * @returns A random contributor ID.
 */
export const generateRandomContributorId = () => {
  const word1 = getRandomWord();
  const word2 = getRandomWord();
  return `${word1}-${word2}`;
};

/**
 * Checks if any combination of the given words exists in the database as contributor IDs.
 *
 * @param postgres - A PostgresClient instance.
 * @param words - An array of words to check for combinations.
 * @returns A promise that resolves to a boolean indicating if any combination exists.
 */
export const anyCombinationExists = async (
  postgres: PostgresClient,
  words: string[],
) => {
  const combinations = [];

  for (let i = 0; i < words.length - 1; i++) {
    for (let j = i + 1; j < words.length; j++) {
      combinations.push(`${words[i]}-${words[j]}`);
    }
  }

  const [result] = await postgres.exec(
    anyContributorIdExistsQuery(combinations),
  );

  return result && result.exists;
};
