import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@sovereign-university/ui';

import { PageLayout } from '#src/components/PageLayout/index.js';
import { BuilderCard } from '#src/features/resources/components/Cards/builder-card.js';
import { trpc } from '#src/utils/trpc.js';

export const BCertificate = () => {
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
      title={t('bCertificate.pageTitle')}
      subtitle={t('bCertificate.pageSubtitle')}
      footerVariant="dark"
    >
      <div className="flex flex-col items-center text-white">
        <div className="max-w-[1017px] md:mt-14 flex flex-row flex-wrap justify-center items-center gap-4 md:gap-11">
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
                cardWidth="w-[90px]"
              />
            </Link>
          ))}
        </div>
        <div className="relative flex flex-col justify-center items-center pb-10 sm:pb-40 lg:pb-10">
          <a
            href="https://framaforms.org/node-application-planb-network-1708081674"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 z-10"
          >
            <Button variant="newSecondary" onHoverArrow size="l">
              {t('nodeNetwork.apply')}
            </Button>
          </a>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 md:gap-14">
        <div className="max-md:hidden h-px bg-newGray-1 w-full" />
        <div className="text-center">
          <span className="text-darkOrange-5 max-md:text-xs max-md:font-medium max-md:leading-normal md:desktop-h7">
            {t('bCertificate.organizeSubtitle')}
          </span>
          <h3 className="text-white mobile-h3 md:desktop-h3 md:mb-2">
            {t('bCertificate.organizeTitle')}
          </h3>
          <p className="desktop-h8 max-w-2xl mx-auto">
            {t('bCertificate.organizeDescription')}
          </p>
        </div>
        <div className="max-md:hidden h-px bg-newGray-1 w-full" />
      </div>
    </PageLayout>
  );
};
