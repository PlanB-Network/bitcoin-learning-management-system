import { Link, createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Loader } from '@blms/ui';

import { PageLayout } from '#src/components/page-layout.js';
import { resourceImgUrl, trpc } from '#src/utils/index.ts';
import { formatNameForURL } from '#src/utils/string.ts';

import { ProjectCard } from '../resources/-components/cards/project-card.js';

import { CommunitiesMap } from './-components/communities-map.tsx';

export const Route = createFileRoute('/$lang/_content/_misc/node-network')({
  component: NodeNetwork,
});

const normalizeText = (text: string): string => {
  return text
    .trim()
    .toLowerCase()
    .replaceAll(/[^\dA-Za-z]/g, '');
};

function NodeNetwork() {
  const { t, i18n } = useTranslation();

  const { data: communities, isFetched } = trpc.content.getProjects.useQuery(
    {
      language: i18n.language ?? 'en',
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  const { data: projectLocations } =
    trpc.content.getProjectsLocations.useQuery();
  const filteredCommunities = communities
    ? communities
        .filter((el) => el.category.toLowerCase() === 'communities')
        .map((community) => {
          const normalizedCommunityAddress = normalizeText(
            community.addressLine1 ?? '',
          );

          const location = projectLocations?.find((loc: { name: string }) => {
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
        <p className="px-2 max-w-4xl mx-auto text-center text-xs md:desktop-subtitle1 text-newGray-1 leading-[1.66] tracking-[0.4px]  mt-1 md:mt-0 max-md:hidden">
          {t('nodeNetwork.descriptionExtend')}
        </p>

        <div className="w-full  mt-10">
          <CommunitiesMap communities={filteredCommunities} />
        </div>

        <div>
          <p className="block md:hidden max-w-4xl mx-auto px-2 text-center text-lg desktop-subtitle1 text-white leading-[1.66] tracking-[0.4px] mt-4 md:mt-0">
            {t('nodeNetwork.descriptionExtend')}
          </p>
        </div>

        <div className="max-w-[1017px] mt-8 sm:mt-14 flex flex-wrap justify-center items-center gap-4 sm:gap-11">
          {!isFetched && <Loader size={'s'} />}
          {filteredCommunities.map((community) => {
            const projectName = formatNameForURL(community.name);
            const projectId = community.id.toString();

            return (
              <Link
                to={`/resources/projects/${projectName}-${projectId}`}
                key={community.id}
                className="flex flex-col items-center"
              >
                <ProjectCard
                  name={community.name}
                  logo={resourceImgUrl(community, 'logo.webp')}
                  cardWidth="size-[70px] sm:size-[90px]"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
