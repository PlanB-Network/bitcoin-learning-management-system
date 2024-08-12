import type { JoinedTutorialLight } from '@blms/types';

import exchangeSvg from '#src/assets/tutorials/exchange.svg';
import merchantSvg from '#src/assets/tutorials/merchant.svg';
import miningSvg from '#src/assets/tutorials/mining.svg';
import nodeSvg from '#src/assets/tutorials/node.svg';
import otherSvg from '#src/assets/tutorials/other.svg';
import privacySvg from '#src/assets/tutorials/privacy.svg';
import walletSvg from '#src/assets/tutorials/wallet.svg';

export const TUTORIALS_CATEGORIES = [
  {
    name: 'wallet',
    image: walletSvg,
  },
  {
    name: 'node',
    image: nodeSvg,
  },
  {
    name: 'mining',
    image: miningSvg,
  },
  {
    name: 'merchant',
    image: merchantSvg,
  },
  {
    name: 'exchange',
    image: exchangeSvg,
  },
  {
    name: 'privacy',
    image: privacySvg,
  },
  {
    name: 'others',
    image: otherSvg,
  },
] as const;

export const extractSubCategories = (tutorials: JoinedTutorialLight[]) => {
  return [
    ...new Set(
      tutorials
        .filter(Boolean)
        .map((t) => t.subcategory)
        .filter((sub): sub is string => sub !== null && sub !== undefined),
    ),
  ] as string[];
};
