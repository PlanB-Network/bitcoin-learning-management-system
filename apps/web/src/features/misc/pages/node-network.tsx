import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { LuPlus } from 'react-icons/lu';

import { Button } from '@sovereign-university/ui';

import { PageLayout } from '#src/components/PageLayout/index.js';
import { BuilderCard } from '#src/features/resources/components/Cards/builder-card.js';
import { trpc } from '#src/utils/trpc.js';

// import SonarCircle from '../../../assets/about/circle_sonar.svg';
import nodeMap from '../../../assets/about/node_map.webp';

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
        <span className="group-open:rotate-45 transition-transform">
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
    <div className="flex w-full flex-col">
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
  const { t, i18n } = useTranslation();

  const { data: communities } = trpc.content.getBuilders.useQuery({
    language: i18n.language ?? 'en',
  });

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
        <div className="max-w-[1017px] mt-14 flex flex-row flex-wrap justify-center items-center gap-4 md:gap-11">
          {filteredCommunities.map((community) => (
            <Link
              to={'/resources/builder/$builderId'}
              params={{
                builderId: community.id.toString(),
              }}
              key={community.id}
            >
              <BuilderCard
                name={community.name}
                logo={community.logo}
                cardWidth="w-[50px] md:w-[90px]"
              />
            </Link>
          ))}
        </div>
        <img src={nodeMap} alt="Node map" className="my-20" />
        <QnA />
        <div className="relative flex flex-col justify-center">
          {/* <SonarCircle /> NEED TO FIX */}
          <a
            href="https://framaforms.org/node-application-planb-network-1708081674"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10"
          >
            <Button variant="newSecondary" size="l">
              {t('nodeNetwork.apply')}
            </Button>
          </a>
        </div>
      </div>
    </PageLayout>
  );
};
