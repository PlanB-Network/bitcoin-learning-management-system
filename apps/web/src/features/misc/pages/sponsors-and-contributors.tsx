import { useTranslation } from 'react-i18next';

import headerImage from '../../../assets/lapin-diplome.png';
import { Link } from '@tanstack/react-router';

export const SponsorsAndContributors = () => {
  const { t } = useTranslation();

  // Static array of About category
  const aboutCategories = [
    t('about.categories.rabbitholeDigger'),
    t('about.categories.hareExplorer'),
    t('about.categories.bunnyForerunner'),
    t('about.categories.earlySupporters'),
    t('about.categories.professors'),
    t('about.categories.developpers'),
    t('about.categories.designers'),
    t('about.categories.helpers'),
  ];
  // Static array of About category
  const thanks = [
    {
      content: t('about.thanks1'),
    },
    {
      content: t('about.thanks2'),
    },
  ];

  // Static array of Twitter profile URLs
  const twitterProfile = [
    {
      name: 'Fanis Michalakis',
      link: 'https://twitter.com/FanisMichalakis',
      image:
        'https://pbs.twimg.com/profile_images/1377643078979366912/WzrcZiF4_400x400.jpg',
    },
    {
      name: 'Wizardsardine',
      link: 'https://twitter.com/Wizardsardine',
      image:
        'https://pbs.twimg.com/profile_images/1654512125778305026/gMdt2K_e_400x400.jpg',
    },
    {
      name: 'BDK',
      link: 'https://twitter.com/bitcoindevkit',
      image:
        'https://pbs.twimg.com/profile_images/1449103535107231747/wjVd3KNN_400x400.jpg',
    },
    {
      name: 'Breeze',
      link: 'https://twitter.com/Breez_Tech',
      image:
        'https://pbs.twimg.com/profile_images/1396954480822919172/Zs-kMWR2_400x400.jpg',
    },
    {
      name: 'Fanis Michalakis',
      link: 'https://twitter.com/FanisMichalakis',
      image:
        'https://pbs.twimg.com/profile_images/1377643078979366912/WzrcZiF4_400x400.jpg',
    },
    {
      name: 'Fanis Michalakis',
      link: 'https://twitter.com/FanisMichalakis',
      image:
        'https://pbs.twimg.com/profile_images/1377643078979366912/WzrcZiF4_400x400.jpg',
    },
  ];

  return (
    // <MainLayout footerVariant="dark">
    <div className="bg-primary-900 flex flex-col justify-center">
      <div className="flex flex-wrap justify-evenly text-center text-xl  text-white sm:py-20">
        <div>
          <img className="mx-auto h-48" src={headerImage} alt="Rabbit" />
          <h2 className="my-8 w-full px-4 py-1">{t('about.pageSubtitle')}</h2>
          <Link
            className="bg-secondary-400 group m-auto mx-2 mb-1 h-fit w-20 min-w-[100px] rounded-md px-4 py-2 text-center text-white delay-100 hover:z-20 hover:delay-0"
            to="/learn-more"
            style={{ fontSize: '20px', padding: '10px 20px' }}
          >
            {t('about.headerLink')}
          </Link>
        </div>
      </div>
      <div className="grid grid-rows-2 items-center justify-center">
        {aboutCategories.map((category, index) => {
          return (
            <div className="my-10 flex flex-col items-center justify-center">
              <h3
                key={category}
                className="mb-8 text-center text-5xl font-bold text-white"
              >
                {category}
              </h3>
              ;
              <div className="grid max-w-6xl grid-cols-6">
                {twitterProfile.map((profile, id) => (
                  <Link
                    className="group m-auto mx-6 mb-8 h-fit w-32 delay-100 hover:z-20 hover:delay-0"
                    to={profile.link}
                    target="_blank"
                    key={id}
                  >
                    <div className="group-hover:bg-secondary-400 relative m-auto mb-2 h-fit rounded-t-full px-2 pt-2 transition duration-500 ease-in-out group-hover:scale-125">
                      <img
                        className="mx-auto h-24 rounded-full bg-white"
                        src={`${profile.image}`} // Placeholder for profile image URL
                        alt={`Profile ${id + 1}`}
                      />
                      <p className="wrap align-center inset-y-end group-hover:bg-secondary-400 absolute inset-x-0 h-fit w-full rounded-b-lg px-4 py-2 text-center text-xs font-light text-white transition-colors duration-500 ease-in-out">
                        <span className="opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100">
                          {`${profile.name}`}
                        </span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              {index % 2 === 1 && Math.floor(index / 2) < thanks.length && (
                <div className="mt-4 flex max-w-[60%] flex-col border-t border-white pt-4 text-center text-white">
                  <span>{thanks[Math.floor(index / 2)].content}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
    // </MainLayout>
  );
};
