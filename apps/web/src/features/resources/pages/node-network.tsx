import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { Trans, useTranslation } from 'react-i18next';

import { cn } from '@sovereign-university/ui';

import btcLyonLogo from '../../../assets/home/btcLyonLogo.png';
import btcMap from '../../../assets/home/btcMap.png';
import cuboPlusLogo from '../../../assets/home/cuboPlusLogo.png';
import hbsLogo from '../../../assets/home/hbsLogo.png';
import kiveclairLogo from '../../../assets/home/kiveclairLogo.png';
import NodeMap from '../../../assets/home/nodemap.svg';
import planBLogo from '../../../assets/home/planBLogo.png';
import rocketForm from '../../../assets/home/rocket_strokeonly.svg';
import stageOne from '../../../assets/home/stage1.svg';
import stageTwo from '../../../assets/home/stage2.svg';
import stageFour from '../../../assets/home/stage3.svg';
import { useDisclosure } from '../../../hooks';
import { ResourceLayout } from '../layout';

const QnAItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const { isOpen, toggle } = useDisclosure();

  return (
    <div className="space-y-2">
      <h2
        className="cursor-pointer text-base font-medium text-orange-500 sm:text-xl"
        onClick={toggle}
      >
        <div
          className={cn('mr-3 inline-block', isOpen ? 'rotate-90' : 'rotate-0')}
        >
          {'>'}
        </div>
        {question}
      </h2>
      {isOpen && <p className="text-sm sm:text-base">{answer}</p>}
    </div>
  );
};

const QnA = () => {
  const { t } = useTranslation();

  const questions = [
    {
      question: t('nodeNetwork.question1'),
      answer: t('nodeNetwork.answer1'),
    },
    {
      question: t('nodeNetwork.question2'),
      answer: t('nodeNetwork.answer2'),
    },
    {
      question: t('nodeNetwork.question3'),
      answer: t('nodeNetwork.answer3'),
    },
    {
      question: t('nodeNetwork.question4'),
      answer: t('nodeNetwork.answer4'),
    },
    {
      question: t('nodeNetwork.question5'),
      answer: t('nodeNetwork.answer5'),
    },
  ];

  return (
    <div className="flex w-full flex-col space-y-4 px-4 sm:px-8">
      <h2 className="text-2xl font-semibold text-orange-500 underline decoration-white underline-offset-2 sm:text-3xl">
        Q&A
      </h2>
      <div className="flex w-full flex-col space-y-4 pl-4">
        {questions.map((item) => (
          <QnAItem question={item.question} answer={item.answer} />
        ))}
      </div>
    </div>
  );
};

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const NodeNetwork = () => {
  const { t } = useTranslation();
  const isScreenMd = useGreater('md');

  return (
    <ResourceLayout
      title={t('nodeNetwork.pageTitle')}
      tagLine={t('nodeNetwork.pageSubtitle')}
    >
      <div className="space-y-12 text-white">
        {/* First section */}
        <div className="flex w-full justify-center px-4 sm:px-8">
          <div className="flex flex-col-reverse md:space-x-4 lg:flex-row">
            <div className="w-full flex-col space-y-4 text-sm sm:mt-3 sm:text-base lg:w-2/5">
              <h4 className="text-lg font-semibold">
                {t('nodeNetwork.descriptionTitle')}
              </h4>
              <p>{t('nodeNetwork.description1')}</p>
              <ul className="ml-2 list-disc space-y-0 pl-4 font-light sm:pl-8 ">
                <li>
                  <Trans t={t} i18nKey="nodeNetwork.description2">
                    <span>A new</span>
                    <span className="text-orange-500">Bitcoin meetup</span>
                    emerges every week.
                  </Trans>
                </li>
                <li>
                  <Trans t={t} i18nKey="nodeNetwork.description3">
                    <span>Educational centers,</span>
                    <span className="text-orange-500"> hackerspaces</span>, and
                    Bitcoin office spaces are on the rise.
                  </Trans>
                </li>
                <li>
                  <Trans t={t} i18nKey="nodeNetwork.description4">
                    <span className="text-orange-500">Secure citadels</span> are
                    under construction.
                  </Trans>
                </li>
              </ul>
              <p>{t('nodeNetwork.description5')}</p>
              <p>{t('nodeNetwork.description6')}</p>
              <h1 className="text-lg font-semibold">
                {t('nodeNetwork.letsBuild')}
              </h1>
            </div>

            <div className="max-w-sm content-center self-center pb-4 sm:pt-4 md:max-w-2xl">
              <img src={NodeMap} alt="" />
            </div>
          </div>
        </div>

        {/* 2nd section */}
        <div className="flex w-full flex-col justify-center px-8 sm:px-12">
          <div className="grid grid-cols-2 place-items-center gap-4 text-center text-base md:grid-cols-4 md:gap-x-8 ">
            <div className="flex flex-col space-y-2">
              <img className="h-40" src={stageOne} alt="Rabbit" />
              {isScreenMd ? (
                <h4>
                  {t('nodeNetwork.stage')} 1 - {t('nodeNetwork.stage1')}
                </h4>
              ) : (
                <div>
                  <h4>{t('nodeNetwork.stage')} 1</h4>
                  <h4>{t('nodeNetwork.stage1')}</h4>
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <img className="h-40" src={stageTwo} alt="Rabbit" />
              {isScreenMd ? (
                <h4>
                  {t('nodeNetwork.stage')} 2 - {t('nodeNetwork.stage2')}
                </h4>
              ) : (
                <div>
                  <h4>{t('nodeNetwork.stage')} 2</h4>
                  <h4>{t('nodeNetwork.stage2')}</h4>
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <img className="h-40" src={stageTwo} alt="Rabbit" />
              {isScreenMd ? (
                <h4>
                  {t('nodeNetwork.stage')} 3 - {t('nodeNetwork.stage3')}
                </h4>
              ) : (
                <div>
                  <h4>{t('nodeNetwork.stage')} 3</h4>
                  <h4>{t('nodeNetwork.stage3')}</h4>
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <img className="h-40" src={stageFour} alt="Rabbit" />
              {isScreenMd ? (
                <h4>
                  {t('nodeNetwork.stage')} 4 - {t('nodeNetwork.stage4')}
                </h4>
              ) : (
                <div>
                  <h4>{t('nodeNetwork.stage')} 4</h4>
                  <h4>{t('nodeNetwork.stage4')}</h4>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="place-items-center items-center justify-center space-y-4 px-4 sm:px-8">
          <p className="text-sm font-thin sm:text-base">
            {t('nodeNetwork.join1')}
          </p>
          <ul className="ml-3 list-disc text-sm font-light sm:pl-8 sm:text-base">
            <li>
              <Trans t={t} i18nKey="nodeNetwork.join2">
                <span className="text-orange-500">Community building</span>{' '}
                support
              </Trans>
            </li>
            <li>
              <Trans t={t} i18nKey="nodeNetwork.join3">
                Educational resources for
                <span className="text-orange-500"> local seminars</span>
              </Trans>
            </li>
            <li>{t('nodeNetwork.join4')}</li>
            <li>{t('nodeNetwork.join5')}</li>
          </ul>
          <h2 className="text-sm font-semibold text-orange-600 sm:text-lg">
            {t('nodeNetwork.join6')}
          </h2>
          <div className="flex items-center justify-center">
            <a
              href="https://github.com/DecouvreBitcoin/sovereign-university-data#join-the-network"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="group relative mt-6 flex h-10 cursor-pointer items-center justify-center rounded-xl bg-orange-500 px-4 transition duration-300 ease-in-out hover:bg-blue-500 sm:h-12">
                <span className="text-blue-1000 text-base group-hover:text-white sm:text-lg">
                  {t('nodeNetwork.join7')}
                </span>

                <div className="text-blue-1000 border-blue-1000 ml-3 hidden items-center rounded-2xl border-2 bg-gray-100 px-2 py-1 text-xs font-medium transition duration-300 ease-in-out hover:bg-gray-200 sm:flex sm:text-lg">
                  <span className="mr-2 text-xs sm:text-base">
                    {t('nodeNetwork.apply')}
                  </span>
                  <img
                    className="text-blue-1000 h-5 w-5"
                    src={rocketForm}
                    alt=""
                  />
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* white collaborators section */}
        <div className="flex w-full flex-col items-center justify-center bg-gray-100 px-5 py-8 md:flex-row md:px-14 lg:px-16">
          <div className="mx-5 flex w-full flex-col items-center justify-center leading-[50px] sm:ml-0 sm:w-full lg:space-y-4">
            <h2 className="items-center text-center text-xl font-semibold text-blue-800 sm:text-2xl md:px-2 lg:text-3xl">
              {t('nodeNetwork.network1')}
            </h2>
            <div className="sm:w-full">
              <div className="flex flex-col items-center sm:place-content-center sm:text-center md:flex-row">
                <img
                  className="m-1 h-28 w-auto max-w-full md:h-32"
                  src={planBLogo}
                  alt="PlanB Logo"
                />
              </div>
            </div>
            {/* <div className="flex flex-col items-center sm:flex-row sm:flex-wrap sm:place-content-center"> */}
            <div className="flex flex-row flex-wrap items-center justify-center">
              <img
                className="m-1 h-16 w-auto max-w-full md:h-24"
                src={btcLyonLogo}
                alt="BTC Lyon"
              />
              <img
                className="m-1 h-16 w-auto max-w-full md:h-24"
                src={cuboPlusLogo}
                alt="Cubo Plus SV"
              />
              <img
                className="m-1 h-16 w-auto max-w-full md:h-24"
                src={hbsLogo}
                alt="HB.s com"
              />
              <img
                className="m-1 h-16 w-auto md:h-24"
                src={kiveclairLogo}
                alt="Kiveclair"
              />
            </div>
          </div>

          <div className="my-6 flex flex-col items-center text-sm font-semibold sm:ml-12 sm:text-lg md:my-0 lg:max-w-xl">
            <h3 className="text-blue-1000 mb-4 text-center">
              {t('nodeNetwork.partnerBTCMap')}
            </h3>
            <img
              src={btcMap}
              alt="BTC Map"
              className="h-52 sm:h-4/5 sm:w-4/5"
            />
          </div>
        </div>

        {/* Q&A section */}
        <QnA />
      </div>
    </ResourceLayout>
  );
};
