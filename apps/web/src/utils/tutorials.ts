/* eslint-disable import/no-duplicates */
import type { JoinedTutorial } from '@blms/types';

import exchangeSvg from '../assets/tutorials/exchange.svg';
import exchangeSvgIcon from '../assets/tutorials/exchange.svg?react';
import merchantSvg from '../assets/tutorials/merchant.svg';
import merchantSvgIcon from '../assets/tutorials/merchant.svg?react';
import miningSvg from '../assets/tutorials/mining.svg';
import miningSvgIcon from '../assets/tutorials/mining.svg?react';
import nodeSvg from '../assets/tutorials/node.svg';
import nodeSvgIcon from '../assets/tutorials/node.svg?react';
import otherSvg from '../assets/tutorials/other.svg';
import otherSvgIcon from '../assets/tutorials/other.svg?react';
import privacySvg from '../assets/tutorials/privacy.svg';
import privacySvgIcon from '../assets/tutorials/privacy.svg?react';
import walletSvg from '../assets/tutorials/wallet.svg';
import walletSvgIcon from '../assets/tutorials/wallet.svg?react';

export const TUTORIALS_CATEGORIES = [
  {
    name: 'wallet',
    image: walletSvg,
    icon: walletSvgIcon,
    route: '/tutorials/wallet',
    images: 23,
  },
  {
    name: 'node',
    image: nodeSvg,
    icon: nodeSvgIcon,
    route: '/tutorials/node',
    images: 5,
  },
  {
    name: 'mining',
    image: miningSvg,
    icon: miningSvgIcon,
    route: '/tutorials/mining',
    images: 2,
  },
  {
    name: 'merchant',
    image: merchantSvg,
    icon: merchantSvgIcon,
    route: '/tutorials/merchant',
    images: 3,
  },
  {
    name: 'exchange',
    image: exchangeSvg,
    icon: exchangeSvgIcon,
    route: '/tutorials/exchange',
    images: 12,
  },
  {
    name: 'privacy',
    image: privacySvg,
    icon: privacySvgIcon,
    route: '/tutorials/privacy',
    images: 4,
  },
  {
    name: 'others',
    image: otherSvg,
    icon: otherSvgIcon,
    route: '/tutorials/others',
    images: 4,
  },
];

export const extractSubCategories = (tutorials: JoinedTutorial[]) => {
  return [
    ...new Set(tutorials.filter(Boolean).map((t) => t.subcategory)),
  ] as string[];
};
