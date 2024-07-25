import { BsCart, BsCpu, BsCurrencyExchange, BsWallet2 } from 'react-icons/bs';
import { LiaToolsSolid, LiaUserSecretSolid } from 'react-icons/lia';
import { SiRaspberrypi } from 'react-icons/si';

import type { JoinedTutorial } from '@blms/types';

import exchangeSvg from '../assets/tutorials/exchange.svg';
import merchantSvg from '../assets/tutorials/merchant.svg';
import miningSvg from '../assets/tutorials/mining.svg';
import nodeSvg from '../assets/tutorials/node.svg';
import otherSvg from '../assets/tutorials/other.svg';
import privacySvg from '../assets/tutorials/privacy.svg';
import walletSvg from '../assets/tutorials/wallet.svg';

export const TUTORIALS_CATEGORIES = [
  {
    name: 'wallet',
    image: walletSvg,
    icon: BsWallet2,
    route: '/tutorials/wallet',
    images: 23,
  },
  {
    name: 'node',
    image: nodeSvg,
    icon: SiRaspberrypi,
    route: '/tutorials/node',
    images: 5,
  },
  {
    name: 'mining',
    image: miningSvg,
    icon: BsCpu,
    route: '/tutorials/mining',
    images: 2,
  },
  {
    name: 'merchant',
    image: merchantSvg,
    icon: BsCart,
    route: '/tutorials/merchant',
    images: 3,
  },
  {
    name: 'exchange',
    image: exchangeSvg,
    icon: BsCurrencyExchange,
    route: '/tutorials/exchange',
    images: 12,
  },
  {
    name: 'privacy',
    image: privacySvg,
    icon: LiaUserSecretSolid,
    route: '/tutorials/privacy',
    images: 4,
  },
  {
    name: 'others',
    image: otherSvg,
    icon: LiaToolsSolid,
    route: '/tutorials/others',
    images: 4,
  },
];

export const extractSubCategories = (tutorials: JoinedTutorial[]) => {
  return [
    ...new Set(tutorials.filter(Boolean).map((t) => t.subcategory)),
  ] as string[];
};
