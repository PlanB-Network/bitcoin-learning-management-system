import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { FiDownload, FiEdit } from 'react-icons/fi';
import { IoIosSearch } from 'react-icons/io';

import type { BetViewUrl } from '@sovereign-university/types';
import { Button } from '@sovereign-university/ui';

import Spinner from '#src/assets/spinner_orange.svg?react';
import { useGreater } from '#src/hooks/use-greater.js';
import type { VerticalCardProps } from '#src/molecules/VerticalCard/index.js';
import { VerticalCard } from '#src/molecules/VerticalCard/index.js';
import { trpc } from '#src/utils/trpc.js';

import { ResourceLayout } from './-other/layout.tsx';

export const Route = createFileRoute('/_content/resources/bet')({
  component: BET,
});

const Section = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col">{children}</div>;
};

const SectionTitle = ({ children }: { children: string }) => {
  return (
    <h2 className="mobile-h3 max-md:text-darkOrange-5 md:desktop-h3 md:text-center mb-2">
      {children}
    </h2>
  );
};

const SectionDescription = ({ children }: { children: string }) => {
  return (
    <p className="max-md:hidden text-center mb-2 md:mb-12 desktop-body1">
      {children}
    </p>
  );
};

const SectionGrid = ({
  elements,
  cardColor,
}: {
  elements: Array<{
    name: string;
    builder: string;
    downloadUrl: string;
    viewurls: BetViewUrl[];
    logo: string;
  }>;
  cardColor: VerticalCardProps['cardColor'];
}) => {
  const { t, i18n } = useTranslation();

  const language = i18n.language;

  const isScreenMd = useGreater('md');

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {elements.map((item, index) => {
        const currentLanguageViewUrl =
          item.viewurls.find((el) => el.language === language)?.viewUrl ||
          item.viewurls[0].viewUrl;

        return (
          <VerticalCard
            key={index}
            title={item.name}
            subtitle={item.builder}
            imageSrc={item.logo}
            languages={[]}
            buttonLink={currentLanguageViewUrl}
            buttonText={t('words.view')}
            buttonIcon={<IoIosSearch size={isScreenMd ? 24 : 16} />}
            buttonVariant="newSecondary"
            buttonMode="colored"
            secondaryLink={item.viewurls[0].viewUrl}
            secondaryButtonText={t('words.edit')}
            secondaryButtonIcon={<FiEdit size={isScreenMd ? 24 : 16} />}
            secondaryButtonVariant="newSecondary"
            secondaryButtonMode="colored"
            tertiaryLink={item.downloadUrl}
            tertiaryButtonIcon={<FiDownload size={isScreenMd ? 24 : 16} />}
            tertiaryButtonVariant="ghost"
            tertiaryButtonMode="colored"
            externalLink
            onHoverArrow={false}
            cardColor={cardColor}
            onHoverCardColorChange
            className="max-w-80"
          />
        );
      })}
    </div>
  );
};

function BET() {
  const { t, i18n } = useTranslation();

  const { data: bets, isFetched } = trpc.content.getBets.useQuery(
    {
      language: i18n.language ?? 'en',
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  return (
    <ResourceLayout
      title={t('bet.pageTitle')}
      tagLine={t('bet.pageSubtitle')}
      activeCategory="bet"
      marginTopChildren={false}
      maxWidth="1360"
      hidePageHeaderMobile
    >
      <div className="flex flex-col text-newGray-5 mt-8 max-md:mx-2">
        <p className="max-w-4xl mx-auto text-center mobile-subtitle2 md:desktop-h7 max-md:mb-6">
          {t('bet.pageDescription')}
        </p>

        <div className="h-px max-w-6xl w-full bg-newGray-1 max-md:hidden my-16 mx-auto" />

        <div className="flex flex-col max-md:gap-7">
          {/* Section of Educational Content */}
          <Section>
            <SectionTitle>{t('bet.educationalContent.title')}</SectionTitle>
            <SectionDescription>
              {t('bet.educationalContent.description')}
            </SectionDescription>
            {!isFetched && <Spinner className="size-24 md:size-32 mx-auto" />}
            <SectionGrid
              elements={
                bets
                  ?.filter((bet) => bet.type === 'educational content')
                  .map((bet) => {
                    return {
                      name: bet.name,
                      builder: bet.builder || '',
                      downloadUrl: bet.downloadUrl,
                      viewurls: bet.viewurls as BetViewUrl[],
                      logo: bet.logo,
                    };
                  }) || []
              }
              cardColor="orange"
            />
          </Section>

          <div className="h-px max-w-6xl w-full bg-newGray-1 max-md:hidden my-16 mx-auto" />

          {/* Section of Visual Content */}
          <Section>
            <SectionTitle>{t('bet.visualContent.title')}</SectionTitle>
            <SectionDescription>
              {t('bet.visualContent.description')}
            </SectionDescription>
            {!isFetched && <Spinner className="size-24 md:size-32 mx-auto" />}
            <SectionGrid
              elements={
                bets
                  ?.filter((bet) => bet.type === 'visual content')
                  .map((bet) => {
                    return {
                      name: bet.name,
                      builder: bet.builder || '',
                      downloadUrl: bet.downloadUrl,
                      viewurls: bet.viewurls as BetViewUrl[],
                      logo: bet.logo,
                    };
                  }) || []
              }
              cardColor="maroon"
            />
          </Section>
        </div>

        <div className="h-px max-w-6xl w-full bg-newGray-1 max-md:hidden my-16 mx-auto" />

        <div className="max-md:mt-7 w-full max-w-4xl mx-auto border border-newBlack-5 rounded-[1.25rem] px-2.5 py-4 md:p-5">
          <h3 className="desktop-h6 max-md:text-darkOrange-5 text-[40px] font-normal leading-tight tracking-[0.25px] max-md:text-center mb-2.5">
            {t('bet.contributeTitle')}
          </h3>
          <div className="flex items-center justify-center max-md:flex-col md:gap-10">
            <p className="max-md:text-center desktop-typo1 md:text-xl md:leading-snug max-md:mb-2.5 md:max-w-[541px]">
              {t('bet.contributeDescription')}
            </p>
            <a
              href="https://github.com/DecouvreBitcoin/sovereign-university-data"
              target="_blank"
              className="max-md:mx-auto md:ml-auto shrink-0"
              rel="noreferrer"
            >
              <Button variant="newPrimary" onHoverArrow size="l">
                {t('bet.contributeButton')}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </ResourceLayout>
  );
}
