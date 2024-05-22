import { useTranslation } from 'react-i18next';

import { Button, cn } from '@sovereign-university/ui';

import { useGreater } from '#src/hooks/use-greater.js';

import { MainLayout } from '../../../components/MainLayout/index.tsx';
import { useDisclosure } from '../../../hooks/index.ts';

const QnAItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const { isOpen, toggle } = useDisclosure();

  return (
    <div>
      <button onClick={toggle}>
        <div className="flex cursor-pointer flex-row text-base font-medium sm:text-xl items-center">
          <span className="uppercase text-orange-500">{question}</span>
          <div
            className={cn(
              'ml-2 text-2xl sm:text-3xl font-light mr-3 inline-block',
              isOpen ? 'rotate-45' : 'rotate-0',
            )}
          >
            {'+'}
          </div>
        </div>
      </button>
      {isOpen && (
        <p className="max-w-2xl whitespace-pre-line text-sm">{answer}</p>
      )}
      <hr className="mb-4 mt-6 border-gray-800" />
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
        <QnAItem
          question={item.question}
          answer={item.answer}
          key={item.question}
        />
      ))}
    </div>
  );
};

export const NodeNetwork = () => {
  const { t } = useTranslation();
  const isScreenXl = useGreater('xl');
  const isScreenLg = useGreater('lg');
  const isScreenMd = useGreater('md');
  const isScreenSm = useGreater('sm');

  let mapWidth;
  if (isScreenXl) {
    mapWidth = 1200;
  } else if (isScreenLg) {
    mapWidth = 900;
  } else if (isScreenMd) {
    mapWidth = 700;
  } else if (isScreenSm) {
    mapWidth = 550;
  } else {
    mapWidth = window.innerWidth - 100;
  }

  return (
    <MainLayout>
      <div className="flex flex-col items-center">
        <div className="mx-8 mt-24 flex max-w-4xl flex-col items-center text-white">
          <h1 className="text-5xl font-semibold uppercase text-orange-500">
            {t('nodeNetwork.pageTitle')}
          </h1>
          <p className="mt-2 text-center text-sm font-medium uppercase md:text-base">
            {t('nodeNetwork.pageSubtitle')}
          </p>
          <p className="mt-6 max-w-[40rem] text-center text-sm text-gray-400 md:text-base">
            {t('nodeNetwork.description1')}
          </p>
          <a
            className="mt-8 place-self-center"
            href="https://framaforms.org/node-application-planb-network-1708081674"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" glowing={true} className="!text-black">
              {t('nodeNetwork.apply')}
            </Button>
          </a>
          <div className="my-12 w-fit content-center self-center">
            <iframe
              id="btcmap"
              className="rounded-3xl"
              title="BTC Map"
              width={mapWidth}
              height="600"
              allowFullScreen={true}
              allow="geolocation"
              src="https://btcmap.org/communities/map?organization=plan-b-network#12/46.02645/8.93764"
            ></iframe>
          </div>
          <QnA />
        </div>
      </div>
    </MainLayout>
  );
};
