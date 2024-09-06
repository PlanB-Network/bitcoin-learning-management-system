import { Link, createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { FaArrowRightLong } from 'react-icons/fa6';
import { LuPlus } from 'react-icons/lu';

import { Button, Loader, cn } from '@blms/ui';

import SonarCircle from '#src/assets/about/circle_sonar.svg?react';
import nodeMap from '#src/assets/about/node_map.webp';
import { PageLayout } from '#src/components/PageLayout/index.js';
import { trpc } from '#src/utils/trpc.js';

import { BuilderCard } from '../resources/-components/Cards/builder-card.tsx';

export const Route = createFileRoute('/_content/_misc/node-network')({
  component: NodeNetwork,
});

const QnAItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  return (
    <details className="w-full group [&:not(:last-child)]:border-b border-white/25 py-10">
      <summary className="w-full flex cursor-pointer items-center justify-between">
        <span className="desktop-25px-medium uppercase text-darkOrange-5">
          {question}
        </span>
        <span className="group-open:rotate-45 transition-transform opacity-70">
          <LuPlus size={24} />
        </span>
      </summary>
      <p className="w-full whitespace-pre-line leading-normal text-justify max-w-[708px]">
        {answer}
      </p>
    </details>
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
    <div className="flex w-full px-10 sm:px-0 flex-col z-10">
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

function NodeNetwork() {
  const { t, i18n } = useTranslation();

  const { data: communities, isFetched } = trpc.content.getBuilders.useQuery(
    {
      language: i18n.language ?? 'en',
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  const filteredCommunities = communities
    ? communities
        .filter((el) => el.category.toLowerCase() === 'communities')
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <PageLayout
      title={t('nodeNetwork.pageTitle')}
      subtitle={t('nodeNetwork.pageSubtitle')}
      description={t('nodeNetwork.description1')}
      footerVariant="dark"
    >
      <div className="flex flex-col items-center text-white">
        <div className="max-w-[1017px] md:mt-14 flex flex-row flex-wrap justify-center items-center gap-4 md:gap-11">
          {!isFetched && <Loader size={'s'} />}
          {filteredCommunities.map((community) => (
            <Link
              to={'/resources/builders/$builderId'}
              params={{
                builderId: community.id.toString(),
              }}
              key={community.id}
              className="flex flex-col items-center"
            >
              <BuilderCard
                name={community.name}
                logo={community.logo}
                cardWidth="size-[90px]"
              />
            </Link>
          ))}
        </div>
        <img src={nodeMap} alt="Node map" className="max-md:hidden my-20" />
        <QnA />
        <div className="relative flex flex-col justify-center items-center pb-10 sm:pb-40 lg:pb-10">
          <SonarCircle className="max-md:hidden absolute size-72 sm:size-fit z-0" />
          <a
            href="https://web.telegram.org/k/#@ajelex"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 z-10"
          >
            <Button variant="secondary" size="l">
              {t('nodeNetwork.apply')}
              <FaArrowRightLong
                className={cn(
                  'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                  'group-hover:ml-3',
                )}
              />
            </Button>
          </a>
        </div>
      </div>
    </PageLayout>
  );
}
