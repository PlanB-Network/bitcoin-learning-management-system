import { Link, useParams } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BsGithub, BsTwitterX } from 'react-icons/bs';
import { SlGlobe } from 'react-icons/sl';

import { Button, cn } from '@sovereign-university/ui';

import Flag from '#src/atoms/Flag/index.js';
import { useGreater } from '#src/hooks/use-greater.js';

import Nostr from '../../../assets/icons/nostr.svg?react';
import { useNavigateMisc } from '../../../hooks/index.ts';
import { trpc } from '../../../utils/index.ts';
import { BuilderEvents } from '../components/builder-events.tsx';
import { BuilderCard } from '../components/Cards/builder-card.tsx';
import { ResourceLayout } from '../layout.tsx';

export const Builder = () => {
  const { navigateTo404 } = useNavigateMisc();
  const { t, i18n } = useTranslation();
  const { builderId } = useParams({
    from: '/resources/builder/$builderId',
  });
  const isScreenMd = useGreater('sm');
  const { data: builder, isFetched } = trpc.content.getBuilder.useQuery({
    id: Number(builderId),
    language: i18n.language ?? 'en',
  });

  const { data: communities } = trpc.content.getBuilders.useQuery({
    language: i18n.language ?? 'en',
  });

  const { data: events } = trpc.content.getEvents.useQuery();

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
    ? events.filter((event) => event.builder === builder?.name)
    : [];

  const navigateTo404Called = useRef(false);

  useEffect(() => {
    if (!builder && isFetched && !navigateTo404Called.current) {
      navigateTo404();
      navigateTo404Called.current = true;
    }
  }, [builder, isFetched, navigateTo404]);

  return (
    <ResourceLayout
      title={t('builders.pageTitle')}
      tagLine={t('builders.pageSubtitle')}
      link={'/resources/builders'}
      activeCategory="builders"
      backToCategoryButton
    >
      {builder && (
        <article className="w-full border-2 border-darkOrange-5 bg-darkOrange-10 rounded-[1.25rem] mb-24">
          <section className="flex p-[30px]">
            <img
              src={builder?.logo}
              className="rounded-3xl size-[276px] shadow-card-items-dark"
              alt={t('imagesAlt.sthRepresentingCompany')}
            />
            <div className="flex flex-col gap-6 ml-10">
              <h2 className="text-5xl font-medium leading-[116%] text-white">
                {builder.name}
              </h2>

              {/* Links */}
              <div className="flex gap-5 text-white">
                {builder.twitterUrl && (
                  <a
                    href={builder.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BsTwitterX size={isScreenMd ? 32 : 24} />
                  </a>
                )}
                {builder.nostr && (
                  <a
                    href={builder.nostr}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Nostr className={cn(isScreenMd ? 'size-8' : 'size-6')} />
                  </a>
                )}
                {builder.githubUrl && (
                  <a
                    href={builder.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BsGithub size={isScreenMd ? 32 : 24} />
                  </a>
                )}
                {builder.websiteUrl && (
                  <a
                    href={builder.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SlGlobe size={isScreenMd ? 32 : 24} />
                  </a>
                )}
              </div>
              <div className="flex flex-col desktop-h6 text-white">
                <span>{builder.addressLine1}</span>
                <span>{builder.addressLine2}</span>
              </div>
              <div className="flex gap-4 items-center flex-wrap">
                {builder.tags?.map((tag) => (
                  <Button
                    variant="newSecondary"
                    mode="colored"
                    key={tag}
                    className="cursor-default capitalize shadow-card-items-dark"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
            <div className="ml-auto flex flex-col gap-6">
              {builder.languages &&
                (builder.languages as string[])
                  .slice(0, 3)
                  .map((language) => (
                    <Flag
                      code={language}
                      key={language}
                      hasDropShadow
                      className="!w-20 !h-[56px]"
                    />
                  ))}
            </div>
          </section>
          <p className="desktop-h8 whitespace-pre-line text-white p-5">
            {builder.description}
          </p>
        </article>
      )}
      {filteredEvents.length > 0 && <BuilderEvents events={filteredEvents} />}
      <div className="flex flex-col items-center gap-14">
        <div className="h-px bg-newGray-1 w-full" />
        <div className="text-center">
          <span className="text-darkOrange-5 desktop-h7">
            {t('builders.networkStrength')}
          </span>
          <h3 className="text-white desktop-h3">
            {t('builders.otherCommunities')}
          </h3>
        </div>
        <div className="max-w-[1017px] flex flex-row flex-wrap justify-center items-center gap-4 md:gap-11">
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
        <div className="h-px bg-newGray-1 w-full" />
      </div>
    </ResourceLayout>
  );
};
