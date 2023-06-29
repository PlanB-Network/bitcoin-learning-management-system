import { BsCart, BsCpu, BsCurrencyExchange, BsWallet2 } from 'react-icons/bs';
import { LiaUserSecretSolid } from 'react-icons/lia';
import { SiRaspberrypi } from 'react-icons/si';

import { JoinedTutorial } from '@sovereign-academy/types';

import exchangeSvg from '../../assets/tutorials/exchange.svg';
import merchantSvg from '../../assets/tutorials/merchant.svg';
import miningSvg from '../../assets/tutorials/mining.svg';
import nodeSvg from '../../assets/tutorials/node.svg';
import privacySvg from '../../assets/tutorials/privacy.svg';
import walletSvg from '../../assets/tutorials/wallet.svg';
import { Routes } from '../../types';

export const TUTORIALS_CATEGORIES = [
  {
    name: 'wallet',
    image: walletSvg,
    icon: BsWallet2,
    route: Routes.TutorialsWallet,
    images: 23,
  },
  {
    name: 'node',
    image: nodeSvg,
    icon: SiRaspberrypi,
    route: Routes.TutorialsNode,
    images: 5,
  },
  {
    name: 'mining',
    image: miningSvg,
    icon: BsCpu,
    route: Routes.TutorialsMining,
    images: 2,
  },
  {
    name: 'merchant',
    image: merchantSvg,
    icon: BsCart,
    route: Routes.TutorialsMerchant,
    images: 3,
  },
  {
    name: 'exchange',
    image: exchangeSvg,
    icon: BsCurrencyExchange,
    route: Routes.TutorialsExchange,
    images: 12,
  },
  {
    name: 'privacy',
    image: privacySvg,
    icon: LiaUserSecretSolid,
    route: Routes.TutorialsPrivacy,
    images: 4,
  },
];

export const extractSubCategories = (tutorials: JoinedTutorial[]) => {
  return [
    ...new Set(
      tutorials.filter((tutorial) => tutorial).map((t) => t.subcategory)
    ),
  ] as string[];
};
