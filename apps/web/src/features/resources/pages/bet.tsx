import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import btcHere from '../../../assets/resources/btchere.png';
import figmaImage from '../../../assets/resources/figmaimg.png';
import { trpc } from '../../../utils';
import { ResourceLayout } from '../layout';

const FigmaBox = ({ title, description, figmaUrl, imgFig }) => {
  return (
    <a href={figmaUrl} target="_blank" rel="noopener noreferrer">
      <div className="rounded-lg bg-red-600 p-2 shadow-md hover:bg-blue-600 sm:p-4">
        <img
          src={imgFig}
          alt={title}
          className="mb-4 h-32 w-full object-cover"
        />
        <h3 className="mb-2 text-base font-semibold text-gray-100 sm:text-lg">
          {title}
        </h3>
        <p className="text-xs text-gray-100 sm:text-base">{description}</p>
      </div>
    </a>
  );
};

const FigmaBoxContent = ({ title, description, figmaUrl, imgFig }) => {
  return (
    <a href={figmaUrl} target="_blank" rel="noopener noreferrer">
      <div className="w-11/12 rounded-lg bg-green-600 p-2 shadow-md hover:bg-blue-500 sm:w-full sm:p-4">
        <img
          src={imgFig}
          alt={title}
          className="mb-4 h-32 w-full object-cover"
        />
        <h3 className="mb-2 text-base font-semibold text-gray-100 sm:text-lg">
          {title}
        </h3>
        <p className="text-xs text-gray-100 sm:text-base">{description}</p>
      </div>
    </a>
  );
};

export const BET = () => {
  const { t, i18n } = useTranslation();

  // Define the Figma box data. For now, the links and images have not been created.
  const figmaData = [
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
      imgFig: btcHere,
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
    <ResourceLayout
      title={t('Bitcoin Educational  ')}
      tagLine={t(
        'the beT - A Bitcoin open-source ToolKIt for all educational projects',
      )}
    >
      <div className=" px-2">
        <p className="mx-6 pl-0 pr-10  text-gray-100">
          The Sovereign University supports bitcoin educators and local
          communities all over the world, to helpspread bitcoin adoption.
          Towards that goal, we collect and make accessible a large database, of
          both educational content (created by us and by others), as well as
          visual data.
        </p>
        <h1 className="my-4 px-6 font-semibold text-gray-100">
          BET IS HERE FOR YOU!
        </h1>
        <div className="mt-4 grid  ">
          {/* Section of Educational Content */}
          <div className="mb-2  ">
            <h2 className="mb-0 text-2xl font-normal text-gray-100">
              Educational Content
              <hr className="mb-2 w-64 border-t-2 border-orange-600" />
            </h2>
            <p className=" text-base font-light italic text-gray-100">
              This content is meant to be ready to use for educational events
              and use.
            </p>

            <div className="mt-6   overflow-x-auto">
              <div className=" grid grid-cols-2 gap-4   sm:w-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                {figmaData.slice(0, 4).map((item, index) => (
                  <FigmaBox key={index} {...item} />
                ))}
              </div>
            </div>
          </div>

          {/* Section of Visual Content */}
          <div className="mt-2">
            <h2 className="mb-0 text-2xl font-normal text-gray-100">
              Visual Content
              <hr className="mb-2 w-44 border-t-2 border-orange-600" />
            </h2>
            <p className=" text-base font-light italic text-gray-100">
              This content is raw visual data, to be used for your creations.
            </p>

            <div className="mt-6  overflow-x-auto">
              <div className="grid  w-auto grid-cols-2 place-content-center  gap-4 sm:w-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                {figmaData.slice(5, 8).map((item, index) => (
                  <FigmaBoxContent key={index} {...item} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="my-6 items-center">
          <hr />
          <p className="mx-8 my-5 px-6 text-center uppercase text-gray-100">
            This toolkit is open to contribution. It uses Figma, so anyone can
            add, modify and translate. To coLlaBorate, add a category or
            discuss, don't hesitate to join our discord.
          </p>
          <hr />
        </div>
      </div>
    </ResourceLayout>
  );
};
