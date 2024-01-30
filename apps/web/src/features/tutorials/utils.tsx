import { BsCart, BsCpu, BsCurrencyExchange, BsWallet2 } from 'react-icons/bs';
import { LiaUserSecretSolid } from 'react-icons/lia';
import { SiRaspberrypi } from 'react-icons/si';

import exchangeSvg from '../../assets/tutorials/exchange.svg';
import merchantSvg from '../../assets/tutorials/merchant.svg';
import miningSvg from '../../assets/tutorials/mining.svg';
import nodeSvg from '../../assets/tutorials/node.svg';
import privacySvg from '../../assets/tutorials/privacy.svg';
import walletSvg from '../../assets/tutorials/wallet.svg';
import { TRPCRouterOutput } from '../../utils/trpc';

export const TUTORIALS_CATEGORIES = [
  {
    name: 'wallet',
    image: walletSvg,
    icon: BsWallet2,
  },
  {
    name: 'node',
    image: nodeSvg,
    icon: SiRaspberrypi,
  },
  {
    name: 'mining',
    image: miningSvg,
    icon: BsCpu,
  },
  {
    name: 'merchant',
    image: merchantSvg,
    icon: BsCart,
  },
  {
    name: 'exchange',
    image: exchangeSvg,
    icon: BsCurrencyExchange,
  },
  {
    name: 'privacy',
    image: privacySvg,
    icon: LiaUserSecretSolid,
  },
] as const;

export const extractSubCategories = (
  tutorials: NonNullable<TRPCRouterOutput['content']['getTutorials']>,
) => {
  return [
    ...new Set(
      tutorials.filter((tutorial) => tutorial).map((t) => t.subcategory),
    ),
  ] as string[];
};
