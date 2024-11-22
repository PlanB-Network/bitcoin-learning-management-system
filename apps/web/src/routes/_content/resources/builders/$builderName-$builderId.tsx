import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BsGithub, BsTwitterX } from 'react-icons/bs';
import { SlGlobe } from 'react-icons/sl';
import { z } from 'zod';

import { Button, Loader, cn } from '@blms/ui';

import Nostr from '#src/assets/icons/nostr.svg?react';
import { ProofreadingProgress } from '#src/components/proofreading-progress.js';
import { useGreater } from '#src/hooks/use-greater.js';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.ts';
import { BackLink } from '#src/molecules/backlink.tsx';
import Flag from '#src/molecules/Flag/index.js';
import { assetUrl } from '#src/utils/index.ts';
import { formatNameForURL } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.js';

import { BuilderEvents } from '../-components/builder-events.tsx';
import { BuilderCard } from '../-components/cards/builder-card.tsx';
import { ResourceLayout } from '../-components/resource-layout.tsx';

export const Route = createFileRoute(
  '/_content/resources/builders/$builderName-$builderId',
)({
  params: {
    parse: (params) => {
      const builderNameId = params['builderName-$builderId'];
      const builderId = builderNameId.split('-').pop();
      const builderName = builderNameId.slice(
        0,
        Math.max(0, builderNameId.lastIndexOf('-')),
      );

      return {
        'builderName-$builderId': `${builderName}-${builderId}`,
        builderName: z.string().parse(builderName),
        builderId: z.number().int().parse(Number(builderId)),
      };
    },
    stringify: ({ builderName, builderId }) => ({
      'builderName-$builderId': `${builderName}-${builderId}`,
    }),
  },
  component: Builder,
});

function Builder() {
  const { t, i18n } = useTranslation();
  const params = Route.useParams();
  const navigate = useNavigate();
  const { navigateTo404 } = useNavigateMisc();

  const isScreenMd = useGreater('sm');
  const { data: builder, isFetched } = trpc.content.getBuilder.useQuery(
    {
      id: params.builderId,
      language: i18n.language ?? 'en',
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  const { data: communities } = trpc.content.getBuilders.useQuery(
    {
      language: i18n.language ?? 'en',
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  const { data: events } = trpc.content.getRecentEvents.useQuery();

  const { data: proofreading } = trpc.content.getProofreading.useQuery({
    language: i18n.language,
    resourceId: params.builderId,
  });

  const filteredCommunities = communities
    ? communities
        .filter(
          (el) =>
            el.category.toLowerCase() === 'communities' &&
            el.name !== builder?.name,
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const filteredEvents = events
    ? events.filter(
        (event) =>
          event.builder === builder?.name && event.startDate > new Date(),
      )
    : [];

  useEffect(() => {
    if (builder && params.builderName !== formatNameForURL(builder.name)) {
      navigate({
        to: `/resources/builders/${formatNameForURL(builder.name)}-${builder.id}`,
      });
    }
  }, [builder, isFetched, navigateTo404, navigate, params.builderName]);

  return (
    <ResourceLayout
      title={t('builders.pageTitle')}
      tagLine={t('builders.pageSubtitle')}
      link={'/resources/builders'}
      activeCategory="builders"
      showPageHeader={false}
      backToCategoryButton
      showResourcesDropdownMenu={false}
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !builder && (
        <div className="w-[768px] mx-auto text-white">
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.builder'),
          })}
        </div>
      )}
      {builder && (
        <>
          <BackLink to={'/resources/builders'} label={t('words.builders')} />
          <article className="w-full border-2 border-darkOrange-5 bg-darkOrange-10 rounded-[1.25rem] mb-7 md:mb-24">
            {proofreading ? (
              <ProofreadingProgress
                mode="dark"
                proofreadingData={{
                  contributors: proofreading.contributorsId,
                  reward: proofreading.reward,
                }}
              />
            ) : (
              <></>
            )}
            <section className="flex p-2 md:p-[30px]">
              <div className="flex flex-col gap-3">
                <img
                  src={assetUrl(builder.path, 'logo.webp')}
                  className="rounded-2xl md:rounded-3xl size-[84px] md:size-[276px] shadow-card-items-dark"
                  alt={t('imagesAlt.sthRepresentingCompany')}
                />
                <div className="flex justify-center gap-2.5 md:hidden">
                  {builder.languages &&
                    builder.languages
                      .slice(0, 2)
                      .map((language) => (
                        <Flag
                          code={language}
                          key={language}
                          className="!w-[26px] !h-[18px] shadow-card-items-dark"
                        />
                      ))}
                </div>
              </div>
              <div className="flex flex-col md:gap-6 ml-4 md:ml-10">
                <h2 className="text-2xl md:text-5xl md:font-medium leading-none md:leading-[116%] text-white">
                  {builder.name}
                </h2>

                {/* Links */}
                <div className="flex gap-4 md:gap-5 text-white max-md:mt-2">
                  {builder.twitterUrl && (
                    <a
                      href={builder.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <BsTwitterX size={isScreenMd ? 32 : 16} />
                    </a>
                  )}
                  {builder.nostr && (
                    <a
                      href={builder.nostr}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Nostr
                        className={cn(
                          'fill-white',
                          isScreenMd ? 'size-8' : 'size-4',
                        )}
                      />
                    </a>
                  )}
                  {builder.githubUrl && (
                    <a
                      href={builder.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <BsGithub size={isScreenMd ? 32 : 16} />
                    </a>
                  )}
                  {builder.websiteUrl && (
                    <a
                      href={builder.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <SlGlobe size={isScreenMd ? 32 : 16} />
                    </a>
                  )}
                </div>
                {(builder.addressLine1 ||
                  builder.addressLine2 ||
                  builder.addressLine3) && (
                  <div className="flex flex-col mobile-caption1 max-md:leading-tight md:desktop-h6 text-white max-md:mt-2 !font-normal">
                    <span>{builder.addressLine1}</span>
                  </div>
                )}
                <div className="flex gap-2.5 md:gap-4 items-center flex-wrap max-md:mt-1.5">
                  {builder.tags?.map((tag) => (
                    <Button
                      variant="transparent"
                      key={tag}
                      className="cursor-default capitalize shadow-card-items-dark"
                      size={isScreenMd ? 'm' : 'xs'}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="ml-auto flex flex-col gap-3 max-md:hidden">
                {builder.category === 'communities' && (
                  <>
                    <span className="text-xs font-medium text-white text-center mb-1">
                      {t('builders.languages')}
                    </span>
                    <div className="flex justify-center flex-col gap-2.5 ">
                      {builder.languages &&
                        builder.languages
                          .slice(0, 3)
                          .map((language) => (
                            <Flag
                              code={language}
                              key={language}
                              className="!w-[70px] !h-[49px] shadow-card-items-dark"
                            />
                          ))}
                    </div>
                  </>
                )}
              </div>
            </section>
            <p className="mobile-body2 md:desktop-h8 whitespace-pre-line text-white p-2.5 md:p-5 break-words">
              {builder.description}
            </p>
          </article>
          {builder.category === 'communities' && (
            <BuilderEvents events={filteredEvents} />
          )}
        </>
      )}
      {builder?.category === 'communities' && (
        <div className="flex flex-col items-center gap-4 md:gap-14">
          <div className="max-md:hidden h-px bg-newGray-1 w-full" />
          <div className="text-center">
            <span className="text-darkOrange-5 max-md:text-xs max-md:font-medium max-md:leading-normal md:desktop-h7">
              {t('builders.networkStrength')}
            </span>
            <h3 className="text-white mobile-h3 md:desktop-h3">
              {t('builders.otherCommunities')}
            </h3>
          </div>
          <div className="max-w-[1017px] flex flex-row flex-wrap justify-center items-center gap-4 md:gap-11">
            {filteredCommunities.map((community) => (
              <Link
                to={`/resources/builders/${formatNameForURL(community.name)}-${community.id}`}
                params={{
                  builderId: community.id.toString(),
                }}
                key={community.id}
              >
                <BuilderCard
                  name={community.name}
                  logo={assetUrl(community.path, 'logo.webp')}
                  cardWidth="w-[50px] md:w-[90px]"
                />
              </Link>
            ))}
          </div>
          <div className="max-md:hidden h-px bg-newGray-1 w-full" />
        </div>
      )}
    </ResourceLayout>
  );
}
