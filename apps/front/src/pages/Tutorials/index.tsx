import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import tutoRabbitPng from '../../assets/tutorial-rabbit.png';
import lightningSvg from '../../assets/tutorials/lightning.svg';
import merchantSvg from '../../assets/tutorials/merchant.svg';
import miningSvg from '../../assets/tutorials/mining.svg';
import nodeSvg from '../../assets/tutorials/node.svg';
import walletSvg from '../../assets/tutorials/wallet.svg';
import { MainLayout } from '../../components';
import { Routes } from '../../types';

enum TutorialKinds {
  Wallet = 'wallet',
  Node = 'node',
  Mining = 'mining',
  Lightning = 'lightning',
  Merchant = 'merchant',
}

const tutorialKinds = [
  {
    kind: TutorialKinds.Wallet,
    title: 'Wallet',
    image: walletSvg,
    description: "Solution de sécurisation et d'utilisation de vos bitcoins",
    route: Routes.Wallets,
  },
  {
    kind: TutorialKinds.Node,
    title: 'Node',
    image: nodeSvg,
    description: "Solution de sécurisation et d'utilisation de vos bitcoins",
    route: Routes.Node,
  },
  {
    kind: TutorialKinds.Mining,
    title: 'Mining',
    image: miningSvg,
    description: "Solution de sécurisation et d'utilisation de vos bitcoins",
    route: Routes.Mining,
  },
  {
    kind: TutorialKinds.Lightning,
    title: 'Lightning',
    image: lightningSvg,
    description: "Solution de sécurisation et d'utilisation de vos bitcoins",
    route: Routes.Lightning,
  },
  {
    kind: TutorialKinds.Merchant,
    title: 'Merchant',
    image: merchantSvg,
    description: "Solution de sécurisation et d'utilisation de vos bitcoins",
    route: Routes.Home,
  },
];

export const Tutorials = () => {
  const { t } = useTranslation();

  return (
    <MainLayout>
      <div className="bg-primary-700 flex flex-col justify-center">
        <div className="bg-primary-900 flex flex-wrap justify-evenly px-6 pb-12 pt-8 text-white sm:pb-40">
          <div>
            <h1 className="-ml-6 text-[62px] font-thin xl:text-[128px]">
              {t('tutorials.pageTitle')}
            </h1>
            <div className="text-s max-w-sm space-y-6 text-justify">
              <p>{t('tutorials.headerText')}</p>
              <p>{t('tutorials.headerSignature')}</p>
            </div>
          </div>
          <img className="mt-6 max-h-96" src={tutoRabbitPng} />
        </div>

        <div className="bg-primary-700 ml-[50%] box-content flex w-[950px] max-w-[90vw] -translate-x-1/2 flex-row flex-wrap justify-evenly rounded-[50px] px-12 py-8">
          {tutorialKinds.map((tutorialKind) => (
            <Link to={tutorialKind.route}>
              <div
                className="hover:bg-primary-600 relative my-4 box-content flex h-24 w-64 cursor-pointer flex-row rounded-lg p-2 duration-300"
                key={tutorialKind.kind}
              >
                <div className="bg-secondary-400 absolute z-0 flex h-24 w-24 rounded-full">
                  <img className="m-auto h-16" src={tutorialKind.image} />
                </div>
                <div className="relative -ml-8 mt-4 flex flex-row items-center">
                  <div className="z-1 relative ml-32 pl-2 text-white">
                    <h3 className="text-2xl">{tutorialKind.title}</h3>
                    <p className="text-xs italic">{tutorialKind.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};
