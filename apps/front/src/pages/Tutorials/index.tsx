import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import tutoRabbitPng from '../../assets/tutorial-rabbit.png';
import exchangeSvg from '../../assets/tutorials/exchange.svg';
import merchantSvg from '../../assets/tutorials/merchant.svg';
import miningSvg from '../../assets/tutorials/mining.svg';
import nodeSvg from '../../assets/tutorials/node.svg';
import privacySvg from '../../assets/tutorials/privacy.svg';
import walletSvg from '../../assets/tutorials/wallet.svg';
import { Card } from '../../atoms/Card';
import { MainLayout } from '../../components';
import { Routes } from '../../types';
import { computeAssetCdnUrl } from '../../utils';

enum TutorialKinds {
  Wallet = 'wallet',
  Node = 'node',
  Mining = 'mining',
  Merchant = 'merchant',
  Exchange = 'exchange',
  Privacy = 'privacy',
}

export const Tutorials = () => {
  const { t } = useTranslation();

  const tutorialKinds = [
    {
      kind: TutorialKinds.Wallet,
      title: t('tutorials.wallet.title'),
      image: walletSvg,
      description: t('tutorials.wallet.description'),
      route: Routes.UnderConstruction,
      images: 23,
    },
    {
      kind: TutorialKinds.Node,
      title: t('tutorials.node.title'),
      image: nodeSvg,
      description: t('tutorials.node.description'),
      route: Routes.UnderConstruction,
      images: 5,
    },
    {
      kind: TutorialKinds.Mining,
      title: t('tutorials.mining.title'),
      image: miningSvg,
      description: t('tutorials.mining.description'),
      route: Routes.UnderConstruction,
      images: 2,
    },
    {
      kind: TutorialKinds.Merchant,
      title: t('tutorials.merchant.title'),
      image: merchantSvg,
      description: t('tutorials.merchant.description'),
      route: Routes.UnderConstruction,
      images: 3,
    },
    {
      kind: TutorialKinds.Exchange,
      title: t('tutorials.exchange.title'),
      image: exchangeSvg,
      description: t('tutorials.exchange.description'),
      route: Routes.UnderConstruction,
      images: 12,
    },
    {
      kind: TutorialKinds.Privacy,
      title: t('tutorials.privacy.title'),
      image: privacySvg,
      description: t('tutorials.privacy.description'),
      route: Routes.UnderConstruction,
      images: 4,
    },
  ];

  return (
    <MainLayout footerVariant="light">
      <div className=" flex flex-col justify-center bg-gray-100">
        <div className="bg-primary-900 relative mb-10 flex flex-col items-center px-5 pb-10 pt-8 text-white md:mb-80 md:pb-80 lg:mb-60 lg:px-16 lg:pb-60">
          <div className="flex w-full grid-cols-2 flex-col flex-wrap items-center justify-evenly md:grid md:pl-8 lg:space-x-5 lg:pl-12">
            <div className="px-5 lg:px-0">
              <h1 className="z-10 -ml-6 mb-5 text-[62px] font-thin md:text-7xl lg:text-8xl xl:text-[112px]">
                {t('tutorials.pageTitle')}
              </h1>
              <div className="space-y-6 text-justify text-base md:max-w-xs lg:max-w-sm xl:max-w-md">
                <p>{t('tutorials.headerText')}</p>
                <p>{t('tutorials.headerSignature')}</p>
              </div>
            </div>
            <img
              className="z-0 mb-10 mt-6 max-h-72 md:max-h-60 lg:max-h-80 xl:max-h-96"
              src={tutoRabbitPng}
              alt=""
            />
          </div>
          <div className="bg-primary-700 inset-x-0 bottom-0 left-1/2 z-10 flex w-full max-w-min flex-row flex-wrap justify-evenly rounded-3xl px-12 py-8 shadow md:absolute md:max-w-3xl md:-translate-x-1/2 md:translate-y-1/2 lg:max-w-5xl">
            {tutorialKinds.map((tutorialKind) => (
              <Link to={tutorialKind.route} onClick={(e) => e.preventDefault()}>
                <div
                  className="hover:bg-primary-600 relative my-4 box-content flex h-24 w-64 cursor-pointer flex-row rounded-lg p-2 duration-300"
                  key={tutorialKind.kind}
                >
                  <div className="bg-secondary-400 absolute z-0 flex h-24 w-24 rounded-full">
                    <img
                      className="absolute -left-1/4 bottom-0 m-auto h-14"
                      src={tutorialKind.image}
                      alt=""
                    />
                  </div>
                  <div className="z-10 -ml-8 mt-4 flex flex-row items-center">
                    <div className="ml-32 pl-2 text-white">
                      <h3 className="absolute left-[2.5em] top-[1em] text-2xl">
                        {tutorialKind.title}
                      </h3>
                      <p className="absolute left-[6em] top-[4.5em] text-xs italic">
                        {tutorialKind.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="text-primary-800 mx-5 mb-10 max-w-3xl text-justify text-3xl md:mx-auto">
          {t('tutorials.soon')}
        </div>
        <div className="mx-auto grid max-w-6xl md:grid-cols-2 ">
          {tutorialKinds
            .sort((a, b) => b.images - a.images)
            .map((tutorials, index) => (
              <Card
                key={tutorials.kind}
                className="m-4 rounded-3xl bg-gray-200"
              >
                <h3 className="text-primary-700 mb-2 w-full rounded-md px-4 py-1 text-xl font-semibold uppercase italic">
                  {tutorials.kind}
                </h3>
                <div className="mt-3 flex flex-row flex-wrap items-center pl-2">
                  {Array.from({ length: tutorials.images }).map((_, index) => (
                    <div className="">
                      <img
                        className="m-1 h-16 w-16 rounded-full md:m-2"
                        src={computeAssetCdnUrl(
                          'f1389fcae8a3c2642bda8f6ff3196ec1b46e027a',
                          `soon/tutorials/${tutorials.kind}/${index}.png`
                        )}
                        alt=""
                      />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
        </div>
      </div>
    </MainLayout>
  );
};
