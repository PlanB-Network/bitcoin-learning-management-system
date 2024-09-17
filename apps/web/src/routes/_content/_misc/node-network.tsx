import { Link, createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { FaArrowRightLong } from 'react-icons/fa6';
import { LuPlus } from 'react-icons/lu';

import { Button, Loader, cn } from '@blms/ui';

import SonarCircle from '#src/assets/about/circle_sonar.svg?react';
import { PageLayout } from '#src/components/page-layout.js';
import { trpc } from '#src/utils/trpc.js';

import { BuilderCard } from '../resources/-components/cards/builder-card.tsx';

import { CommunitiesMap } from './-components/communities-map.tsx';

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
      <p className="w-full whitespace-pre-line leading-normal text-justify max-w-[708px] text-sm sm:text-base">
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
    <div className="flex w-full px-4 sm:px-10 flex-col z-10">
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

const normalizeText = (text: string): string => {
  return text
    .trim()
    .toLowerCase()
    .replaceAll(/[^\dA-Za-z]/g, '');
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

  const { data: builderLocations } =
    trpc.content.getBuildersLocations.useQuery();
  const filteredCommunities = communities
    ? communities
        .filter((el) => el.category.toLowerCase() === 'communities')
        .map((community) => {
          const normalizedCommunityAddress = normalizeText(
            community.addressLine1 ?? '',
          );

          const location = builderLocations?.find((loc: { name: string }) => {
            const normalizedLocationName = normalizeText(loc.name);
            return normalizedLocationName === normalizedCommunityAddress;
          });
          return {
            ...community,
            lat: location?.lat ?? 0,
            lng: location?.lng ?? 0,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <PageLayout
      title={t('nodeNetwork.pageTitle')}
      subtitle={t('nodeNetwork.pageSubtitle')}
      description={t('nodeNetwork.description1')}
      footerVariant="dark"
    >
      <div className="flex flex-col items-center text-white px-4 sm:px-10">
        <div className="max-w-[1017px] mt-8 sm:mt-14 flex flex-wrap justify-center items-center gap-4 sm:gap-11">
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
                cardWidth="size-[70px] sm:size-[90px]"
              />
            </Link>
          ))}
        </div>

        <div className="w-full  mt-10">
          <CommunitiesMap communities={filteredCommunities} />
        </div>

        <QnA />

        <div className="relative flex flex-col justify-center items-center pb-10 sm:pb-40 lg:pb-10">
          <SonarCircle className="hidden md:block absolute size-72 sm:size-fit z-0" />
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
