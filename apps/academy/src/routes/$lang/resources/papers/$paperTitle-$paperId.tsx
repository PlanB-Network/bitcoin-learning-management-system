import { formatNameForURL, LANGUAGES_MAP } from '@blms/shared';
import { Button, Loader, TextTag } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TbBuildingCommunity,
  TbDownload,
  TbExternalLink,
  TbFileInfo,
  TbLanguage,
} from 'react-icons/tb';
import { z } from 'zod';
import { PageLayout } from '#src/components/page-layout.tsx';
import { getNameAndIdFromUrl } from '#src/services/utils.tsx';
import { trpc } from '#src/utils/index.js';
import { ListElement2 } from '../../_course/courses/$courseSlug/_$courseSlug/summer-school.tsx';

export const Route = createFileRoute(
  '/$lang/resources/papers/$paperTitle-$paperId',
)({
  component: Paper,
  params: {
    parse: (params) => {
      const paperTitleId = params['paperTitle-$paperId'];
      const { id, name } = getNameAndIdFromUrl(paperTitleId);

      return {
        paperId: z.string().parse(id),
        paperTitle: z.string().parse(name),
        'paperTitle-$paperId': `${name}-${id}`,
        lang: z.string().parse(params.lang),
      };
    },
    stringify: ({ lang, paperTitle, paperId }) => ({
      'paperTitle-$paperId': `${paperTitle}-${paperId}`,
      lang: lang,
    }),
  },
});

function Paper() {
  const params = Route.useParams();
  const { t } = useTranslation();

  const { data: paper, isFetched } = useQuery(
    trpc.content.getResearchPaper.queryOptions({
      id: params.paperId,
      language: params.lang,
    }),
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (paper && params.paperTitle !== formatNameForURL(paper.title)) {
      navigate({
        replace: true,
        to: `/resources/papers/${formatNameForURL(paper.title)}-${paper.id}`,
      });
    }
  }, [paper, isFetched, navigate, params.paperName]);

  return (
    <PageLayout
      backLink={{
        href: '/resources/papers',
        text: t('resources.papers.papers'),
      }}
      layoutSize="wide"
      title={paper?.title ?? undefined}
      hideTitle
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !paper && (
        <div>
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.researchPaper'),
          })}
        </div>
      )}
      {paper && (
        <div className="flex flex-col w-full">
          <h1 className="display-base md:display-semibold-40px">
            {paper.title}
          </h1>
          <p className="mt-1 md:mt-4 body-small md:label text-neutral-800">
            {paper.authors.join(', ')}
            {paper.publicationDate ? (
              <span className="md:body-large text-neutral-400">
                {`  •  ${new Date(paper.publicationDate).toLocaleDateString(
                  'en-GB',
                  {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  },
                )}
                `}
              </span>
            ) : (
              ''
            )}
          </p>
          {paper.topics && paper.topics.length > 0 ? (
            <div className="flex flex-wrap gap-1 md:gap-2 mt-6 md:mt-4">
              {paper.topics?.map((topic) => (
                <TextTag
                  key={topic}
                  size="small"
                  variant="grey"
                  className="capitalize"
                >
                  {topic}
                </TextTag>
              ))}
            </div>
          ) : null}
          <h2 className="mt-6 md:mt-8 subtitle-base md:title-medium text-neutral-900">
            {t('words.abstract')}
          </h2>
          <p className="whitespace-pre-line mt-4 md:mt-1 text-neutral-900 body-small md:body-base">
            {paper.abstract}
          </p>
          <section className="mt-8 rounded-2xl border border-neutral-100 max-md:hidden">
            <div className="flex justify-between items-center pl-4 pr-2 py-2">
              <span className="body-base">{paper.title}</span>
              <a
                href={paper.paperUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="s" className="gap-2">
                  {t('resources.papers.accessPaper')}
                  <TbExternalLink size={16} />
                </Button>
              </a>
            </div>
            <div className="flex justify-between items-center pl-4 pr-2 py-2 border-t border-neutral-100">
              <span className="body-base">
                {t('resources.papers.citations')}
              </span>
              <a
                href={`/api/files/${paper.bibUrl}`}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="s" className="gap-2" variant="newTertiary">
                  {t('words.download')}
                  <TbDownload size={16} />
                </Button>
              </a>
            </div>
          </section>

          <section className="flex flex-col gap-4 w-full md:hidden mt-6">
            <a href={paper.paperUrl} target="_blank" rel="noopener noreferrer">
              <Button size="m" className="gap-2 w-full">
                {t('resources.papers.accessPaper')}
                <TbExternalLink size={16} />
              </Button>
            </a>
            <a
              href={`/api/files/${paper.bibUrl}`}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="m" className="gap-2 w-full" variant="newTertiary">
                {t('resources.papers.downloadCitations')}
                <TbDownload size={16} />
              </Button>
            </a>
          </section>

          <section className="flex flex-col bg-neutral-50 text-newBlack-3 rounded-2xl mt-6 md:mt-8 p-3">
            <div className="flex flex-col w-full gap-7">
              <section className="flex flex-col w-full gap-2">
                <p className="body-base-bold px-1">{t('words.details')}</p>
                <div className="bg-white p-3 rounded-2xl">
                  <ListElement2 icon={TbFileInfo} leftText={t('words.type')}>
                    {t(`resources.papers.types.${paper.type}`, {
                      defaultValue: paper.type,
                    })}
                  </ListElement2>
                  <ListElement2
                    icon={TbBuildingCommunity}
                    leftText={t('resources.papers.publisher')}
                  >
                    {paper.source}
                  </ListElement2>
                  <ListElement2
                    icon={TbLanguage}
                    leftText={t('words.language')}
                  >
                    {LANGUAGES_MAP[paper.language] || paper.language}
                  </ListElement2>
                </div>
              </section>
            </div>
          </section>
        </div>
      )}
    </PageLayout>
  );
}
