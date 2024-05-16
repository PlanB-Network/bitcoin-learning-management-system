import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import { FiDownload } from 'react-icons/fi';
import { IoIosSearch } from 'react-icons/io';

import { Button } from '@sovereign-university/ui';

import type { VerticalCardProps } from '#src/molecules/VerticalCard/index.js';
import { VerticalCard } from '#src/molecules/VerticalCard/index.js';

import poster from '../../../assets/resources/bet/21poster.webp';
import anil from '../../../assets/resources/bet/anil.webp';
import artistes from '../../../assets/resources/bet/artiste.webp';
import bookscover from '../../../assets/resources/bet/bookcover.webp';
import btcHere from '../../../assets/resources/bet/btcacceptedhere.webp';
import dbCourses from '../../../assets/resources/bet/dbcourses.webp';
import mpbitcoin from '../../../assets/resources/bet/diplomampb.webp';
import gifcollection from '../../../assets/resources/bet/gifcollection.webp';
import history from '../../../assets/resources/bet/history.webp';
import hyperinflation from '../../../assets/resources/bet/hyperinflation.webp';
import logosCompanies from '../../../assets/resources/bet/logos.webp';
import meme from '../../../assets/resources/bet/meme.webp';
import propaganda from '../../../assets/resources/bet/propaganda.webp';
import scams from '../../../assets/resources/bet/scams.webp';
import { ResourceLayout } from '../layout.tsx';

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
    title: string;
    description: string;
    figmaUrl: string;
    imgFig: string;
  }>;
  cardColor: VerticalCardProps['cardColor'];
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:w-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {elements.map((item, index) => (
        <VerticalCard
          key={index}
          title={item.title}
          subtitle={item.description}
          imageSrc={item.imgFig}
          languages={[]}
          link={item.figmaUrl}
          buttonText={t('words.view')}
          buttonIcon={<IoIosSearch />}
          buttonVariant="newPrimary"
          secondaryLink={item.figmaUrl}
          secondaryButtonText={t('words.download')}
          secondaryButtonIcon={<FiDownload />}
          secondaryButtonVariant="newSecondary"
          externalLink
          onHoverArrow={false}
          cardColor={cardColor}
          onHoverCardColorChange
        />
      ))}
    </div>
  );
};

export const BET = () => {
  const { t } = useTranslation();

  // The Links and the images are updated.
  const EDUCATIONAL_CONTENT = [
    {
      title: 'All of PlanB courses',
      description: 'DecouvreBitcoin',
      figmaUrl:
        'https://github.com/DecouvreBitcoin/sovereign-university-data/tree/dev/courses',
      imgFig: dbCourses,
    },
    {
      title: 'Anil Illustrations',
      description: 'Example',
      figmaUrl:
        'https://www.figma.com/file/pzyUU3bcrdokNnLdI3o0aX/Bitcoin-Educational-ToolKit-2?type=design&node-id=2%3A1055&mode=design&t=ssejloYtH3ZHS8OV-1',
      imgFig: anil,
    },
    {
      title: ' 21 Posters',
      description: 'Rogzy',
      figmaUrl:
        'https://www.figma.com/file/pzyUU3bcrdokNnLdI3o0aX/Bitcoin-Educational-ToolKit-2?type=design&node-id=0%3A1&mode=design&t=ssejloYtH3ZHS8OV-1',
      imgFig: poster,
    },
    {
      title: 'Bitcoin Diploma ',
      description: 'Mi Primer Bitcoin',
      figmaUrl: 'https://github.com/MyFirstBitcoin',
      imgFig: mpbitcoin,
    },
  ];

  const VISUAL_CONTENT = [
    {
      title: 'Bitcoin accepted here',
      description: 'Team DB',
      figmaUrl:
        'https://www.figma.com/file/pzyUU3bcrdokNnLdI3o0aX/Bitcoin-Educational-ToolKit-2?type=design&node-id=2%3A338&mode=design&t=ssejloYtH3ZHS8OV-1',
      imgFig: btcHere,
    },
    {
      title: 'Bitcoin meme',
      description: 'Anonymous',
      figmaUrl:
        'https://www.figma.com/file/pzyUU3bcrdokNnLdI3o0aX/Bitcoin-Educational-ToolKit-2?type=design&node-id=2%3A818&mode=design&t=ssejloYtH3ZHS8OV-1',
      imgFig: meme,
    },
    {
      title: 'Propaganda Posters',
      description: 'Propaganda Bitcoin posters',
      figmaUrl:
        'https://www.figma.com/file/pzyUU3bcrdokNnLdI3o0aX/Bitcoin-Educational-ToolKit-2?type=design&node-id=2%3A106&mode=design&t=ssejloYtH3ZHS8OV-1',
      imgFig: propaganda,
    },
    {
      title: 'Hyperinflations Bills',
      description: 'David Saint Onge',
      figmaUrl:
        'https://www.figma.com/file/pzyUU3bcrdokNnLdI3o0aX/Bitcoin-Educational-ToolKit-2?type=design&node-id=2%3A71&mode=design&t=ssejloYtH3ZHS8OV-1',
      imgFig: hyperinflation,
    },
    {
      title: 'Bitcoin book',
      description: 'Bitcoin Guides',
      figmaUrl:
        'https://www.figma.com/file/pzyUU3bcrdokNnLdI3o0aX/Bitcoin-Educational-ToolKit-2?type=design&node-id=2%3A230&mode=design&t=ssejloYtH3ZHS8OV-1',
      imgFig: bookscover,
    },
    {
      title: 'Company and project logos',
      description: 'Bitcoin Companies Logo',
      figmaUrl:
        'https://www.figma.com/file/pzyUU3bcrdokNnLdI3o0aX/Bitcoin-Educational-ToolKit-2?type=design&node-id=2-621&mode=design',
      imgFig: logosCompanies,
    },
    {
      title: 'BTC Gift ',
      description: 'Anonymous',
      figmaUrl:
        'https://www.figma.com/file/pzyUU3bcrdokNnLdI3o0aX/Bitcoin-Educational-ToolKit-2?type=design&node-id=3%3A454&mode=design&t=ssejloYtH3ZHS8OV-1',
      imgFig: gifcollection,
    },

    {
      title: 'Scam',
      description: 'Anonymous',
      figmaUrl:
        'https://www.figma.com/file/pzyUU3bcrdokNnLdI3o0aX/Bitcoin-Educational-ToolKit-2?type=design&node-id=3%3A287&mode=design&t=ssejloYtH3ZHS8OV-1',
      imgFig: scams,
    },
    {
      title: 'BTC History',
      description: 'Image Database',
      figmaUrl:
        'https://www.figma.com/file/pzyUU3bcrdokNnLdI3o0aX/Bitcoin-Educational-ToolKit-2?type=design&node-id=8-574&mode=design',
      imgFig: history,
    },
    {
      title: 'BTC Artistes Gallery ',
      description: '',
      figmaUrl:
        'https://www.figma.com/file/pzyUU3bcrdokNnLdI3o0aX/Bitcoin-Educational-ToolKit-2?type=design&node-id=2%3A728&mode=design&t=ssejloYtH3ZHS8OV-1',
      imgFig: artistes,
    },
  ];

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
        <p className="max-w-4xl mx-auto text-center mobile-subtitle2 md:desktop-h7 font-medium max-md:mb-6">
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
            <SectionGrid elements={EDUCATIONAL_CONTENT} cardColor="orange" />
          </Section>

          <div className="h-px max-w-6xl w-full bg-newGray-1 max-md:hidden my-16 mx-auto" />

          {/* Section of Visual Content */}
          <Section>
            <SectionTitle>{t('bet.visualContent.title')}</SectionTitle>
            <SectionDescription>
              {t('bet.visualContent.description')}
            </SectionDescription>
            <SectionGrid elements={VISUAL_CONTENT} cardColor="maroon" />
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
};
