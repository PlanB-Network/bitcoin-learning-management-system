import * as bip39 from 'bip39';

import type { PostgresClient } from '@sovereign-academy/database';
import {
  anyContributorIdExistsQuery,
  contributorIdExistsQuery,
} from '@sovereign-academy/database';

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
  words: string[]
) => {
  const combinations = [];

  for (let i = 0; i < words.length - 1; i++) {
    for (let j = i + 1; j < words.length; j++) {
      combinations.push(`${words[i]}-${words[j]}`);
    }
  }

  const result = await postgres.exec(anyContributorIdExistsQuery(combinations));

  return result.count > 0;
};

/**
 * Checks if the given contributor ID exists in the database.
 *
 * @param postgres - A PostgresClient instance.
 * @param id - The contributor ID to check.
 * @returns A promise that resolves to a boolean indicating if the ID exists.
 */
export const contributorIdExists = async (
  postgres: PostgresClient,
  id: string
) => {
  const [result] = await postgres.exec(contributorIdExistsQuery(id));

  return result['count'] > 0;
};

/**
 * Generates a unique contributor ID that is not already used in the database.
 *
 * @param postgres - A PostgresClient instance.
 * @returns A promise that resolves to a unique contributor ID.
 */
export const generateUniqueContributorId = async (postgres: PostgresClient) => {
  let id: string;

  do {
    id = generateRandomContributorId();
  } while (await contributorIdExists(postgres, id));

  return id;
};
