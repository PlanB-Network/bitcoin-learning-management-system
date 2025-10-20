import { cn, Image, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import headerImage from '#src/assets/about/header.png';
import headerSmallImage from '#src/assets/about/header-small.png';
import media1Image from '#src/assets/about/media-1.png';
import media1SmallImage from '#src/assets/about/media-1-mobile.png';
import valuesBitcoinFirstImage from '#src/assets/icons/bitcoin.png';
import valuesBottomUpImage from '#src/assets/icons/bottom-up.png';
import valuesFreedomImage from '#src/assets/icons/freedom.png';
import valuesOpenSourceImage from '#src/assets/icons/github.png';
import valuesBitcoinFirst2Image from '#src/assets/icons/groups.png';
import valuesPrivacyImage from '#src/assets/icons/visibility_off.png';
import { ContactUs } from '#src/components/contact-us.tsx';
import { Hero } from '#src/components/hero.tsx';
import MediaCard from '#src/components/media-card.tsx';
import NetworkCard from '#src/components/network-card.tsx';
import PageBlock from '#src/components/page-block.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { titleCss } from '#src/utils/css.tsx';
import { resourceImgUrl } from '#src/utils/misc.tsx';
import { trpc } from '#src/utils/trpc.ts';

export const Route = createFileRoute('/about')({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const isMobile = useSmaller('lg');

  const { data: projects, isFetched } = useQuery(
    trpc.content.getProjects.queryOptions({
      language: 'en',
    }),
  );

  const { data: professors, isFetched: isProfessorsFetched } = useQuery(
    trpc.content.getProfessors.queryOptions({
      language: 'en',
    }),
  );

  const { data: contributors, isFetched: isContributorsFetched } = useQuery({
    queryKey: ['github', 'contributors'],
    queryFn: async () => {
      const res = await fetch(
        'https://api.github.com/repos/PlanB-Network/bitcoin-learning-management-system/contributors?per_page=200',
      );
      if (!res.ok) throw new Error('Failed to fetch contributors');
      return res.json();
    },
  });

  const { data: contributorsEdu, isFetched: isContribEduFetched } = useQuery({
    queryKey: ['github', 'contributors', 'bitcoin-educational-content'],
    queryFn: async () => {
      const res = await fetch(
        'https://api.github.com/repos/PlanB-Network/bitcoin-educational-content/contributors?per_page=200',
      );
      if (!res.ok)
        throw new Error('Failed to fetch contributors for educational content');
      return res.json();
    },
  });

  const mergedContributors = useMemo(() => {
    const a = Array.isArray(contributors) ? contributors : [];
    const b = Array.isArray(contributorsEdu) ? contributorsEdu : [];
    const map = new Map<string, any>();
    a.concat(b).forEach((c: any) => {
      const key = c.login;
      if (key === 'weblate') return;
      if (!map.has(key)) {
        map.set(key, { ...c });
      } else {
        const existing = map.get(key);
        existing.contributions =
          (existing.contributions || 0) + (c.contributions || 0);
      }
    });
    return Array.from(map.values()).sort(
      (x: any, y: any) => (y.contributions || 0) - (x.contributions || 0),
    );
  }, [contributors, contributorsEdu]);

  const filteredCommunities = projects
    ? projects
        .filter((el) => el.category.toLowerCase() === 'communities')
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const partnerIds = [
    'd81674bd-9e16-407b-acbe-e8725d01e0a1',
    'b731a421-7e83-44e9-8f2b-f4a51f7a08e2',
    '48ba05d4-d553-4402-9d56-6dab2d7e45dd',
    '28dd0137-b167-4e74-bc43-a5df60b93c00',
    '26d603ee-4b5a-4695-86c1-fe7658294413',
    '5cffb254-278e-4d87-a4d6-4efe5a538dde',
    'ccaacfff-12c3-4b5c-80f8-0f077422d62b',
    'aa91f010-ea13-44f1-ac91-d3f02aea8f21',
    '41c4621e-7411-42a8-9ef9-90c29e19b76a',
    '3ad86f15-94ef-401c-b708-b28c7767b9be',
    '8751d904-fa66-46fa-9421-024be9e375ba',
    'aaa8a7b8-9e89-495f-9697-2a448906d132',
    '272d7b76-af05-4c79-bcce-d3b96b100be1',
    '3b2f45e6-d612-412c-95ba-cf65b49aa5b8',
    '0d0cb36a-a9f4-4698-94b3-94f0942f2090',
    '2a2b12e1-6b33-4bc1-b62d-1964e1578286',
    '10e85d67-c568-462a-b918-a35e2491b450',
    'eb67d966-e019-4b62-8ac3-1b7e1ae83e1c',
    'cf0fecdf-6a70-40ec-869d-c6c78f9fac01',
    '81e4a931-705b-4d28-bbe7-4f4de3196034',
    'f5be605f-4422-451a-a5da-d938a56a16d6',
  ];

  const filteredPartners = projects
    ? projects
        .filter((el) => partnerIds.includes(el.id))

        .sort((a, b) => {
          return partnerIds.indexOf(a.id) - partnerIds.indexOf(b.id);
        })
    : [];

  const valuesCards = [
    {
      title: t('about.ourValues.1textt'),
      subtext: t('about.ourValues.1subtext'),
      imageUrl: valuesBitcoinFirstImage,
    },
    {
      title: t('about.ourValues.2text'),
      subtext: t('about.ourValues.2subtext'),
      imageUrl: valuesOpenSourceImage,
    },
    {
      title: t('about.ourValues.3text'),
      subtext: t('about.ourValues.3subtext'),
      imageUrl: valuesPrivacyImage,
    },
    {
      title: t('about.ourValues.4text'),
      subtext: t('about.ourValues.4subtext'),
      imageUrl: valuesFreedomImage,
    },
    {
      title: t('about.ourValues.5text'),
      subtext: t('about.ourValues.5subtext'),
      imageUrl: valuesBottomUpImage,
    },
    {
      title: t('about.ourValues.6text'),
      subtext: t('about.ourValues.6subtext'),
      imageUrl: valuesBitcoinFirst2Image,
    },
  ];

  return (
    <>
      <Hero
        titleElement={
          <Trans i18nKey="about.title">
            <span className="font-semibold">Network</span>
          </Trans>
        }
        subtitle={t('about.subtitle')}
        imageUrl={isMobile ? headerSmallImage : headerImage}
        subtitleClassName={'max-w-[400px]'}
      />

      <PageBlock
        className="mt-12 lg:mt-24"
        withXMargin={false}
        withYPadding={false}
      >
        <MediaCard
          title={t('about.media1title')}
          subtext={t('about.media1subtitle')}
          imageUrl={isMobile ? media1SmallImage : media1Image}
          alt="Scenic mountain lake"
          titleClassName={'lg:max-w-[700px]'}
          subtitleClassName={'lg:max-w-[40%] max-xl:!text-lg'}
          imageClassName=""
          subtitleUnderImage={true}
        />
      </PageBlock>

      <PageBlock className="mt-12 lg:mt-24" withYPadding={false}>
        <h2 className="display-medium mb-8 max-lg:text-center">
          {t('about.ourValues.title')}
        </h2>
        <div className="flex flex-row flex-wrap gap-2 lg:gap-10 justify-center-safe">
          {valuesCards.map((card) => (
            <NetworkCard
              img={card.imageUrl}
              text={card.title}
              subtext={card.subtext}
              key={card.title}
            />
          ))}
        </div>
      </PageBlock>

      <PageBlock className="mt-12 lg:mt-24" withYPadding={false}>
        <h3 className={cn(titleCss, '!text-center')}>
          {t('about.media2title')}
        </h3>
        <p
          className={cn(
            'text-center subtitle-base max-md:text-base text-gray-200 lg:mx-48 mt-6 lg:mt-12',
          )}
        >
          {t('about.media2subtitle')}
        </p>
      </PageBlock>

      <PageBlock className="mt-8 lg:mt-16" withYPadding={false}>
        <h2 className="text-center display-medium">{t('about.partners')}</h2>
        <div className="max-w-[900px] mt-8 sm:mt-14 flex flex-wrap justify-center items-center gap-y-4 mx-auto">
          {!isFetched && <Loader size={'s'} />}
          {filteredPartners.map((partner) => {
            return (
              <div key={partner.id} className="flex flex-col items-center">
                <ProjectCard
                  name={partner.name}
                  logo={resourceImgUrl(partner, 'logo.webp')}
                  cardWidth=""
                />
              </div>
            );
          })}
        </div>
      </PageBlock>

      <PageBlock className="mt-8 lg:mt-16" withYPadding={false}>
        <h2 className="text-center display-medium">{t('about.communities')}</h2>
        <div className="max-w-[900px] mt-8 sm:mt-14 flex flex-wrap justify-center items-center gap-y-4 mx-auto">
          {!isFetched && <Loader size={'s'} />}
          {filteredCommunities.map((community) => {
            return (
              <div key={community.id} className="flex flex-col items-center">
                <ProjectCard
                  name={community.name}
                  logo={resourceImgUrl(community, 'logo.webp')}
                  cardWidth=""
                />
              </div>
            );
          })}
        </div>
      </PageBlock>

      <PageBlock className="mt-8 lg:mt-16" withYPadding={false}>
        <h2 className="text-center display-medium">{t('about.professors')}</h2>
        <div className="max-w-[900px] mt-8 sm:mt-14 flex flex-wrap justify-center items-center gap-y-4 mx-auto">
          {!isProfessorsFetched && <Loader size={'s'} />}
          {professors
            ? professors.map((professor) => {
                return (
                  <div
                    key={professor.id}
                    className="flex flex-col items-center"
                  >
                    <ProjectCard
                      name={professor.name}
                      logo={resourceImgUrl(professor, 'profile.webp')}
                      cardWidth=""
                    />
                  </div>
                );
              })
            : null}
        </div>
      </PageBlock>

      <PageBlock className="mt-8 lg:mt-16" withYPadding={false}>
        <h2 className="text-center display-medium">
          {t('about.contributors')}
        </h2>
        <div className="max-w-[900px] mt-8 sm:mt-14 flex flex-wrap justify-center items-center gap-y-4 mx-auto">
          {(!isContributorsFetched || !isContribEduFetched) && (
            <Loader size={'s'} />
          )}
          {mergedContributors && Array.isArray(mergedContributors)
            ? mergedContributors.map((c: any) => (
                <Link
                  key={c.id}
                  className="flex flex-col items-center"
                  to={c.html_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ProjectCard
                    name={c.login}
                    logo={c.avatar_url}
                    cardWidth=""
                  />
                </Link>
              ))
            : null}
        </div>
      </PageBlock>

      <ContactUs text={t('about.contactText')} email="toto@toto.com" />
    </>
  );
}

interface ProjectCardProps {
  name: string;
  logo: string;
  cardWidth?: string;
}

export const ProjectCard = (props: ProjectCardProps) => {
  return (
    <div className="flex flex-col items-center gap-2 w-[125px]">
      <Image
        breakpoints={{ default: 100 }}
        className={cn(
          'md:size-18 rounded-full',
          props.cardWidth ? props.cardWidth : 'size-[70px] sm:size-[90px]',
        )}
        src={props.logo}
        alt={props.name}
      />
      <span className="body-base text-gray-200 md:text-center max-md:line-clamp-2 line-clamp-3 text-center">
        {props.name}
      </span>
    </div>
  );
};
