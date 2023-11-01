import { useTranslation } from 'react-i18next';

import { cn } from '@sovereign-university/ui';

import btcHere from '../../../assets/resources/btcherep.png';
import figmaImage from '../../../assets/resources/figmaimg.png';
import { ResourceLayout } from '../layout';

const LinkBox = ({
  title,
  description,
  figmaUrl,
  imgFig,
  cardColor,
  hoverColor,
}: {
  title: string;
  description: string;
  figmaUrl: string;
  imgFig: string;
  cardColor: string;
  hoverColor: string;
}) => {
  return (
    <a href={figmaUrl} target="_blank" rel="noopener noreferrer">
      <div
        className={cn(
          'shrink-0 h-full rounded-lg bg-red-600 p-3 shadow-md hover:bg-blue-600 sm:p-4',
          cardColor,
          hoverColor,
        )}
      >
        <img
          src={imgFig}
          alt={title}
          className="mb-4 h-32 w-full object-cover"
        />
        <h3 className="mb-2 font-semibold">{title}</h3>
        <p className="text-xs sm:text-sm">{description}</p>
      </div>
    </a>
  );
};

const Section = ({ children }: { children: React.ReactNode }) => {
  return <div className="space-y-2">{children}</div>;
};

const SectionTitle = ({ children }: { children: string }) => {
  return (
    <h2 className="text-xl font-normal underline decoration-orange-600 decoration-[3px] underline-offset-[5px] sm:text-2xl">
      {children}
    </h2>
  );
};

const SectionDescription = ({ children }: { children: string }) => {
  return <p className="text-xs font-light italic sm:text-base">{children}</p>;
};

const SectionGrid = ({
  elements,
  cardColor,
  hoverColor,
}: {
  elements: {
    title: string;
    description: string;
    figmaUrl: string;
    imgFig: string;
  }[];
  cardColor: string;
  hoverColor: string;
}) => {
  return (
    <div className="overflow-x-auto py-6">
      <div className="grid grid-cols-2 gap-4 sm:w-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {elements.map((item, index) => (
          <LinkBox
            key={index}
            {...item}
            cardColor={cardColor}
            hoverColor={hoverColor}
          />
        ))}
      </div>
    </div>
  );
};

export const BET = () => {
  const { t } = useTranslation();

  // The Links and the images are updated.
  const EDUCATIONAL_CONTENT = [
    {
      title: 'Adil Infography',
      description: 'By Adil',
      figmaUrl:
        'https://www.figma.com/file/UA2PVH5Fyhubf8Sgi6Maax/Bitcoin-Educational-ToolKit?type=design&node-id=1%3A2&mode=design&t=nzRIbLR8YqtLeY8U-1',
      imgFig: figmaImage,
    },
    {
      title: 'Proyecto 2',
      description: 'Example',
      figmaUrl:
        'https://www.figma.com/file/8N8qLeToPHxXmz0y3xLXAZ/University?type=design&node-id=60%3A12430&mode=design&t=AYsecW2YENpMp9I0-1',
      imgFig: figmaImage,
    },
    {
      title: 'Proyecto 3',
      description: 'Descripción del proyecto 3',
      figmaUrl:
        'https://www.figma.com/file/UA2PVH5Fyhubf8Sgi6Maax/Bitcoin-Educational-ToolKit?type=design&node-id=1%3A2&mode=design&t=nzRIbLR8YqtLeY8U-1',
      imgFig: figmaImage,
    },
    {
      title: 'Bitcoin accepted here',
      description: 'Stickers designs',
      figmaUrl:
        'https://www.figma.com/file/UA2PVH5Fyhubf8Sgi6Maax/Bitcoin-Educational-ToolKit?type=design&node-id=1%3A2&mode=design&t=nzRIbLR8YqtLeY8U-1',
      imgFig: figmaImage,
    },
    {
      title: 'Bitcoin meme',
      description: 'Memes of Bitcoin',
      figmaUrl:
        'https://www.figma.com/file/UA2PVH5Fyhubf8Sgi6Maax/Bitcoin-Educational-ToolKit?type=design&node-id=1%3A2&mode=design&t=nzRIbLR8YqtLeY8U-1',
      imgFig: btcHere,
    },
    {
      title: 'Propaganda Posters',
      description: 'Propaganda Bitcoin posters',
      figmaUrl:
        'https://www.figma.com/file/UA2PVH5Fyhubf8Sgi6Maax/Bitcoin-Educational-ToolKit?type=design&node-id=1%3A2&mode=design&t=nzRIbLR8YqtLeY8U-1',
      imgFig: btcHere,
    },
    {
      title: 'Hyperinflations Bills',
      description: 'Corporate Billing',
      figmaUrl:
        'https://www.figma.com/file/UA2PVH5Fyhubf8Sgi6Maax/Bitcoin-Educational-ToolKit?type=design&node-id=1%3A2&mode=design&t=nzRIbLR8YqtLeY8U-1',
      imgFig: btcHere,
    },
    {
      title: 'Bitcoin book',
      description: 'Bitcoin Guides',
      figmaUrl:
        'https://www.figma.com/file/UA2PVH5Fyhubf8Sgi6Maax/Bitcoin-Educational-ToolKit?type=design&node-id=1%3A2&mode=design&t=nzRIbLR8YqtLeY8U-1',
      imgFig: btcHere,
    },
    {
      title: 'Company and project logos',
      description: 'Bitcoin Companies',
      figmaUrl:
        'https://www.figma.com/file/UA2PVH5Fyhubf8Sgi6Maax/Bitcoin-Educational-ToolKit?type=design&node-id=1%3A2&mode=design&t=nzRIbLR8YqtLeY8U-1',
      imgFig: btcHere,
    },
  ];

  const VISUAL_CONTENT = [
    {
      title: 'Adil Infography',
      description: 'By Adil',
      figmaUrl:
        'https://www.figma.com/file/UA2PVH5Fyhubf8Sgi6Maax/Bitcoin-Educational-ToolKit?type=design&node-id=1%3A2&mode=design&t=nzRIbLR8YqtLeY8U-1',
      imgFig: figmaImage,
    },
    {
      title: 'Proyecto 2',
      description: 'Example',
      figmaUrl:
        'https://www.figma.com/file/8N8qLeToPHxXmz0y3xLXAZ/University?type=design&node-id=60%3A12430&mode=design&t=AYsecW2YENpMp9I0-1',
      imgFig: figmaImage,
    },
    {
      title: 'Proyecto 3',
      description: 'Descripción del proyecto 3',
      figmaUrl:
        'https://www.figma.com/file/UA2PVH5Fyhubf8Sgi6Maax/Bitcoin-Educational-ToolKit?type=design&node-id=1%3A2&mode=design&t=nzRIbLR8YqtLeY8U-1',
      imgFig: figmaImage,
    },
    {
      title: 'Bitcoin accepted here',
      description: 'Stickers designs',
      figmaUrl:
        'https://www.figma.com/file/UA2PVH5Fyhubf8Sgi6Maax/Bitcoin-Educational-ToolKit?type=design&node-id=1%3A2&mode=design&t=nzRIbLR8YqtLeY8U-1',
      imgFig: figmaImage,
    },
    {
      title: 'Bitcoin meme',
      description: 'Memes of Bitcoin',
      figmaUrl:
        'https://www.figma.com/file/UA2PVH5Fyhubf8Sgi6Maax/Bitcoin-Educational-ToolKit?type=design&node-id=1%3A2&mode=design&t=nzRIbLR8YqtLeY8U-1',
      imgFig: btcHere,
    },
    {
      title: 'Propaganda Posters',
      description: 'Propaganda Bitcoin posters',
      figmaUrl:
        'https://www.figma.com/file/UA2PVH5Fyhubf8Sgi6Maax/Bitcoin-Educational-ToolKit?type=design&node-id=1%3A2&mode=design&t=nzRIbLR8YqtLeY8U-1',
      imgFig: btcHere,
    },
    {
      title: 'Hyperinflations Bills',
      description: 'Corporate Billing',
      figmaUrl:
        'https://www.figma.com/file/UA2PVH5Fyhubf8Sgi6Maax/Bitcoin-Educational-ToolKit?type=design&node-id=1%3A2&mode=design&t=nzRIbLR8YqtLeY8U-1',
      imgFig: btcHere,
    },
    {
      title: 'Bitcoin book',
      description: 'Bitcoin Guides',
      figmaUrl:
        'https://www.figma.com/file/UA2PVH5Fyhubf8Sgi6Maax/Bitcoin-Educational-ToolKit?type=design&node-id=1%3A2&mode=design&t=nzRIbLR8YqtLeY8U-1',
      imgFig: btcHere,
    },
    {
      title: 'Company and project logos',
      description: 'Bitcoin Companies',
      figmaUrl:
        'https://www.figma.com/file/UA2PVH5Fyhubf8Sgi6Maax/Bitcoin-Educational-ToolKit?type=design&node-id=1%3A2&mode=design&t=nzRIbLR8YqtLeY8U-1',
      imgFig: btcHere,
    },
  ];

  return (
    <ResourceLayout title={t('bet.pageTitle')} tagLine={t('bet.pageSubtitle')}>
      <div className="space-y-8 px-4 text-gray-100 sm:px-8">
        <div className="max-w-3xl space-y-4">
          <p className="max-w-3xl">{t('bet.pageDescription')}</p>
          <h1 className="font-semibold ">{t('bet.hereForYou')}</h1>
        </div>

        {/* Section of Educational Content */}
        <Section>
          <SectionTitle>{t('bet.educationalContent.title')}</SectionTitle>
          <SectionDescription>
            {t('bet.educationalContent.description')}
          </SectionDescription>
          <SectionGrid
            elements={EDUCATIONAL_CONTENT.slice(0, 4)}
            cardColor="bg-red-600"
            hoverColor="hover:bg-blue-600"
          />
        </Section>

        {/* Section of Visual Content */}
        <Section>
          <SectionTitle>{t('bet.visualContent.title')}</SectionTitle>
          <SectionDescription>
            {t('bet.visualContent.description')}
          </SectionDescription>
          <SectionGrid
            elements={VISUAL_CONTENT.slice(5, 8)}
            cardColor="bg-green-600"
            hoverColor="hover:bg-blue-500"
          />
        </Section>

        <p className="border-y-2 px-8 py-5 text-center uppercase">
          {t('bet.contribute')}
        </p>
      </div>
    </ResourceLayout>
  );
};
