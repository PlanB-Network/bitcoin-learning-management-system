import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useTranslation } from 'react-i18next';
import { BsRocketTakeoff } from 'react-icons/bs';

import { cn } from '@sovereign-university/ui';

import { Button } from '../../../atoms/Button';
import { useDisclosure } from '../../../hooks';
import { ResourceLayout } from '../../resources/layout';

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
          className={cn(
            'text-3xl font-light mr-3 inline-block',
            isOpen ? 'rotate-90' : 'rotate-0',
          )}
        >
          {'>'}
        </div>
        <span className="uppercase">{question}</span>
      </h2>
      {isOpen && (
        <p className="whitespace-pre-line text-sm sm:text-base">{answer}</p>
      )}
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
    <div className="flex w-full flex-col gap-4 px-4 pt-6">
      {questions.map((item) => (
        <QnAItem question={item.question} answer={item.answer} />
      ))}
    </div>
  );
};

export const NodeNetwork = () => {
  const { t } = useTranslation();
  const { useGreater } = BreakPointHooks(breakpointsTailwind);
  const isScreenLg = useGreater('lg');
  const isScreenMd = useGreater('md');
  const isScreenSm = useGreater('sm');

  let mapWidth;
  if (isScreenLg) {
    mapWidth = 900;
  } else if (isScreenMd) {
    mapWidth = 700;
  } else if (isScreenSm) {
    mapWidth = 500;
  } else {
    mapWidth = window.innerWidth - 100;
  }

  return (
    <ResourceLayout
      title={t('nodeNetwork.pageTitle')}
      tagLine={t('nodeNetwork.pageSubtitle')}
    >
      <div className="mx-8 flex max-w-4xl  flex-col text-white">
        <div className="flex w-full max-w-3xl flex-col">
          <p className="text-xl font-semibold">
            {t('nodeNetwork.description1')}
          </p>
          <p className="mt-2">{t('nodeNetwork.description2')}</p>
          <p className="">{t('nodeNetwork.description3')}</p>
        </div>

        <div className="my-12 w-fit content-center self-center">
          <iframe
            id="btcmap"
            className="rounded-3xl border-4 border-orange-500"
            title="BTC Map"
            width={mapWidth}
            height="600"
            allowFullScreen={true}
            allow="geolocation"
            src="https://btcmap.org/communities/map?organization=plan-b-network#12/46.02645/8.93764"
          ></iframe>
        </div>
        <a
          className="place-self-center"
          href="https://github.com/DecouvreBitcoin/sovereign-university-data#join-the-network"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="tertiary" iconRight={<BsRocketTakeoff />}>
            {t('nodeNetwork.apply')}
          </Button>
        </a>
        <QnA />
      </div>
    </ResourceLayout>
  );
};
