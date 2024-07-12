import type { JoinedTutorialLight } from '@sovereign-university/types';

import exchangeSvg from '../../../assets/tutorials/exchange.svg';
import merchantSvg from '../../../assets/tutorials/merchant.svg';
import miningSvg from '../../../assets/tutorials/mining.svg';
import nodeSvg from '../../../assets/tutorials/node.svg';
import otherSvg from '../../../assets/tutorials/other.svg';
import privacySvg from '../../../assets/tutorials/privacy.svg';
import walletSvg from '../../../assets/tutorials/wallet.svg';

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
    ...new Set(tutorials.filter(Boolean).map((t) => t.subcategory)),
  ] as string[];
};
