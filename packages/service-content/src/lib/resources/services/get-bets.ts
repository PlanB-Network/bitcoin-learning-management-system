import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getBetsQuery } from '../queries/get-bets.js';

export const createGetBets = ({ postgres }: Dependencies) => {
  return async (language?: string) => {
    const result = await postgres.exec(getBetsQuery(language));

    return result.map((bet) => ({
      ...bet,
      logo: computeAssetCdnUrl(bet.lastCommit, bet.path, 'logo.webp'),
    }));
  };
};
