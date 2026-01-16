import { Button, Loader } from '@blms/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { capitalize } from 'lodash-es';
import { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TbDownload,
  TbExternalLink,
  TbFile,
  TbLanguage,
  TbUserCircle,
} from 'react-icons/tb';
import { PageLayout } from '#src/components/page-layout.tsx';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.tsx';
import {
  getEducatorContentCoverUrl,
  getEducatorContentFileUrl,
} from '#src/services/content.js';

import { formatFileSize } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.js';
import { EducatorContentModal } from './-components/educator-content-modal.tsx';

export const Route = createFileRoute('/$lang/educator-content/$id')({
  component: EducatorContentDetail,
});

function EducatorContentDetail() {
  const { id } = useParams({ from: '/$lang/educator-content/$id' });
  const { t } = useTranslation();
  const { session } = useContext(AppContext);
  const hasIncrementedDownload = useRef(false);
  const isMobile = useSmaller('md') || window.innerWidth < 768;
  const [isCoverOpen, setIsCoverOpen] = useState(false);

  if (isCoverOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCoverOpen(false);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const {
    open: openEditModal,
    isOpen: isEditModalOpen,
    close: closeEditModal,
  } = useDisclosure();

  const { data: content, isLoading } = useQuery(
    trpc.content.getEducatorContents.queryOptions({
      id,
    }),
  );

  const { data: allExistingLanguages } = useQuery(
    trpc.content.getLanguages.queryOptions(),
  );

  const incrementDownloadsMutation = useMutation(
    trpc.content.incrementDownloads.mutationOptions({
      onSuccess: () => {
        // Optimistically update or invalidate query
      },
    }),
  );

  const item = content?.[0];
  const isOwner = session?.user?.uid === item?.uid;

  const handleIncrementDownload = () => {
    if (item && !hasIncrementedDownload.current) {
      incrementDownloadsMutation.mutate({ id: item.id as string });
      hasIncrementedDownload.current = true;
    }
  };

  const handleDownload = (path: string, filename?: string) => {
    handleIncrementDownload();
    const url = getEducatorContentFileUrl(path, filename);
    window.open(url, '_blank');
    // Trigger the download
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = filename || path.split('/').pop() || 'download';
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    // Then open in a new tab
  };

  const sortedLinks = item?.links?.sort((a, b) =>
    (a.url || '').localeCompare(b.url || ''),
  );
  const sortedFiles = item?.files?.sort((a, b) =>
    (a.name || '').localeCompare(b.name || ''),
  );

  return (
    <PageLayout
      layoutSize="base"
      backLink={{
        href: '/educator-content',
        text: t('menu.educatorContent'),
      }}
      actionButtons={
        isOwner
          ? [
              {
                text: t('words.edit'),
                onClick: openEditModal,
              },
            ]
          : []
      }
    >
      {item ? (
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="grid grid-cols-[auto_1fr] gap-4 md:flex">
            {/* Image */}
            <div className="w-22 h-[66px] md:w-50 md:h-[150px] shrink-0 flex items-center justify-center">
              {item.cover ? (
                <button
                  type="button"
                  className="w-full h-full p-0 bg-transparent border-0 cursor-zoom-in focus:outline-none"
                  onClick={() => (isMobile ? undefined : setIsCoverOpen(true))}
                  aria-label={`Open cover image: ${item.title}`}
                >
                  <img
                    src={getEducatorContentCoverUrl(item.cover) || ''}
                    alt={item.title}
                    className="w-full h-full object-cover border border-neutral-100 rounded-2xl"
                  />
                </button>
              ) : (
                <span className="text-neutral-500 bg-neutral-100 w-full h-full text-center my-auto flex items-center justify-center rounded-2xl">
                  {t('educatorContent.noCover')}
                </span>
              )}
            </div>

            {isCoverOpen && item.cover && (
              <div
                className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60"
                onClick={() => setIsCoverOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsCoverOpen(false);
                }}
                role="dialog"
                aria-label="Close image overlay"
              >
                <div
                  className="relative m-2 md:m-5"
                  role="dialog"
                  aria-modal="true"
                >
                  <img
                    src={getEducatorContentCoverUrl(item.cover) || ''}
                    alt={item.title}
                    className="mx-auto rounded-lg max-w-[min(1920px,100%)] max-h-[80vh] cursor-zoom-out bg-white"
                  />
                </div>
              </div>
            )}
            {/* Info */}
            <div className="contents md:flex md:flex-col md:gap-4 md:min-w-0">
              <h1 className="display-small md:display-medium font-semibold text-black self-center md:self-auto wrap-break-words min-w-0">
                {item.title}
              </h1>
              <p className="body-small text-neutral-700 col-span-2 md:w-auto">
                {item.description}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label={t('educatorContent.detail.addedBy')}
              value={
                item.displayName ?? t('educatorContent.reviewModal.unknown')
              }
              icon={TbUserCircle}
            />
            <StatCard
              label={t('words.category')}
              value={
                item.type
                  ? t(`educatorContent.types.${item.type}`)
                  : t('educatorContent.reviewModal.unknown')
              }
              icon={TbFile}
            />
            <StatCard
              label={t('words.language')}
              value={capitalize(
                allExistingLanguages?.find((l) => l.code === item.language)
                  ?.nativeName || item.language,
              )}
              icon={TbLanguage}
            />
            <StatCard
              label={t('words.downloads')}
              value={item.downloads.toString()}
              icon={TbDownload}
            />
          </div>

          {/* Files and Links List */}
          <div className="bg-white rounded-3xl border border-neutral-50 overflow-hidden shadow-sm">
            <div className="flex flex-col divide-y divide-neutral-50">
              {sortedLinks?.map((link) => (
                <div
                  key={link.url}
                  className="flex items-center justify-between py-2 px-4 hover:bg-neutral-100 transition-colors gap-4"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="body-small md:body-base decoration-orange-500 text-orange-500 underline truncate"
                    onClick={handleIncrementDownload}
                  >
                    {link.url}
                  </a>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline shrink-0"
                    onClick={handleIncrementDownload}
                  >
                    <Button variant="tertiary" size="s" className="gap-4">
                      <span>{t('educatorContent.detail.view')}</span>
                      <TbExternalLink />
                    </Button>
                  </a>
                </div>
              ))}
              {sortedFiles?.map((file) => (
                <div
                  key={file.path}
                  className="flex items-center justify-between py-2 px-4 hover:bg-neutral-100 transition-colors gap-4"
                >
                  <span className="body-small md:body-base text-neutral-700 truncate">
                    {file.name}{' '}
                    <span className="text-neutral-500">
                      ({formatFileSize(file.size)})
                    </span>
                  </span>
                  <Button
                    variant="tertiary"
                    size="s"
                    className="gap-4 shrink-0"
                    onClick={() => handleDownload(file.path, file.name)}
                  >
                    <span>{t('words.open')}</span>
                    <TbDownload />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* License */}
          {item.license && (
            <p className="body-extra-small text-neutral-500 -mt-2">
              {t('educatorContent.license.title')}: {item.license}
            </p>
          )}

          {/* Download All */}
          {item.files && item.files.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="s"
                onClick={() => {
                  handleIncrementDownload();
                  const url = `/api/educator-content/download-all/${item.id}`;
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${item.title || 'educator-content'}.zip`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <span>{t('educatorContent.detail.downloadAll')}</span>
              </Button>
            </div>
          )}
        </div>
      ) : isLoading ? (
        <Loader />
      ) : (
        <div>{t('educatorContent.contentNotFound')}</div>
      )}

      <EducatorContentModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        initialData={item}
      />
    </PageLayout>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="bg-neutral-50 rounded-2xl p-2 md:p-6 flex flex-col items-center justify-center text-center gap-3 min-w-0 w-full">
      <div className="flex items-center gap-2 text-neutral-500">
        {Icon && <Icon className="size-4" />}
        <span className="caption-extra-small uppercase">{label}</span>
      </div>
      <span className="body-base-bold max-w-full truncate" title={value}>
        {value}
      </span>
    </div>
  );
}
