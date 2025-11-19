import type { BetViewUrl } from '@blms/types';
import { Button, cn, Image, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import { TbDownload, TbEye } from 'react-icons/tb';
import { PageLayout } from '#src/components/page-layout.tsx';
import { resourceImgUrl, trpc } from '#src/utils/index.ts';
import { resourcesTabs } from '../index.tsx';

export const Route = createFileRoute('/$lang/resources/bet/')({
  component: BET,
});

function BET() {
  const { t, i18n } = useTranslation();

  const { data: bets, isFetched } = useQuery(
    trpc.content.getBets.queryOptions(
      {
        language: i18n.language ?? 'en',
      },
      {
        staleTime: 300_000, // 5 minutes
      },
    ),
  );

  return (
    <PageLayout
      title={t('resources.bet.title')}
      tabs={resourcesTabs}
      layoutSize="wide"
      actionButtons={[
        {
          text: t('resources.bet.addEducationKit'),
          href: '/tutorials/contribution/resource/add-bet-178d9ed0-598d-45a0-aa66-7f147121e04e',
        },
      ]}
    >
      <div className="flex flex-col max-sm:mt-4 mt-2">
        <div className="flex flex-col gap-4 sm:gap-8">
          <Section>
            <SectionTitle>{t('bet.educationalContent.title')}</SectionTitle>
            {!isFetched && <Loader size={'s'} />}
            <SectionGrid
              elements={
                bets
                  ?.filter((bet) => bet.type === 'educational content')
                  .map((bet) => {
                    return {
                      downloadUrl: bet.downloadUrl,
                      logo: resourceImgUrl(bet, 'logo.webp'),
                      name: bet.name,
                      projectName: bet.projectName || '',
                      viewUrls: bet.viewurls,
                    };
                  }) || []
              }
            />
          </Section>

          <Section>
            <SectionTitle>{t('bet.visualContent.title')}</SectionTitle>
            {!isFetched && <Loader size={'s'} />}
            <SectionGrid
              elements={
                bets
                  ?.filter((bet) => bet.type === 'visual content')
                  .map((bet) => {
                    return {
                      downloadUrl: bet.downloadUrl,
                      logo: resourceImgUrl(bet, 'logo.webp'),
                      name: bet.name,
                      projectName: bet.projectName || '',
                      viewUrls: bet.viewurls,
                    };
                  }) || []
              }
            />
          </Section>
        </div>
      </div>
    </PageLayout>
  );
}

const Section = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col gap-4">{children}</div>;
};

const SectionTitle = ({ children }: { children: string }) => {
  return <h2 className="title-large text-black">{children}</h2>;
};

const SectionGrid = ({
  elements,
}: {
  elements: Array<{
    name: string;
    projectName: string;
    downloadUrl: string;
    viewUrls: BetViewUrl[];
    logo: string;
  }>;
}) => {
  const { i18n } = useTranslation();

  const language = i18n.language;

  return (
    <div className="flex flex-wrap gap-2">
      {elements.map((item) => {
        const currentLanguageViewUrl =
          item.viewUrls.find((el) => el.language === language)?.viewUrl ||
          item.viewUrls[0]?.viewUrl;

        return (
          <BETCard
            key={item.name}
            imageSrc={item.logo}
            title={item.name}
            subtitle={item.projectName}
            viewUrl={currentLanguageViewUrl}
            downloadUrl={item.downloadUrl}
          />
        );
      })}
    </div>
  );
};

const BETCard = ({
  imageSrc,
  title,
  subtitle,
  viewUrl,
  downloadUrl,
}: {
  imageSrc: string;
  title: string;
  subtitle: string;
  viewUrl: string;
  downloadUrl: string;
}) => {
  const GeneralInfos = () => {
    return (
      <div className="flex flex-col justify-between sm:p-4 sm:pt-0 flex-grow sm:gap-7">
        <div className="flex flex-col gap-1 max-sm:grow max-sm:justify-center">
          <span className="title-small sm:title-base text-maroon-11 line-clamp-2">
            {title}
          </span>

          <span className="text-neutral-400 text-sm leading-snug -tracking-015px max-sm:hidden">
            {subtitle}
          </span>
        </div>
        <div className="flex sm:justify-between flex-wrap gap-2 sm:mt-auto max-sm:py-1">
          <Button size="s" variant="secondary" asChild>
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-2"
            >
              {t('words.view')}
              <TbEye size={16} />
            </a>
          </Button>
          <Button size="s" variant="secondary" asChild>
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
              <TbDownload size={16} />
            </a>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <article
      className={cn(
        'flex flex-col w-full sm:w-60 sm:border border-neutral-100 rounded-lg sm:rounded-2xl',
      )}
    >
      <div className="flex max-sm:gap-2 sm:flex-col flex-grow">
        <div className="w-22 sm:w-full overflow-hidden max-sm:rounded-lg sm:rounded-t-2xl sm:rounded-b-lg relative sm:mb-2 max-sm:shrink-0">
          <Image
            breakpoints={{ default: 200, sm: 500 }}
            width="240"
            height="135"
            loading="lazy"
            src={imageSrc}
            alt={title}
            className="object-cover [overflow-clip-margin:_unset] aspect-[88/56] sm:aspect-[240/135] w-full h-full max-sm:rounded-l-lg sm:rounded-t-2xl sm:rounded-b-lg"
          />
        </div>
        <GeneralInfos />
      </div>
    </article>
  );
};
