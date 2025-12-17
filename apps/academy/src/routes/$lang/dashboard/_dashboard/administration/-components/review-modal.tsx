import type { JoinedEducatorContent } from '@blms/types';
import { BasicModal, Button } from '@blms/ui';
import { capitalize } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import {
  TbCheck,
  TbDownload,
  TbExternalLink,
  TbFile,
  TbLanguage,
  TbTrash,
  TbUserCircle,
} from 'react-icons/tb';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import {
  getEducatorContentCoverUrl,
  getEducatorContentFileUrl,
} from '#src/services/content.js';
import { getLanguageName } from '#src/utils/i18n.ts';

interface RootReviewModalProps {
  content: JoinedEducatorContent;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
  onUnpublish: () => void;
  isApprovePending?: boolean;
  isRejectPending?: boolean;
  isUnpublishPending?: boolean;
  isUnpublishMode?: boolean;
}

export const ReviewModal = ({
  content,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onEdit,
  onUnpublish,
  isApprovePending,
  isRejectPending,
  isUnpublishPending,
  isUnpublishMode,
}: RootReviewModalProps) => {
  const { t } = useTranslation();

  const isMobile = useSmaller('lg');

  const sortedLinks = content?.links?.sort((a, b) =>
    (a.url || '').localeCompare(b.url || ''),
  );
  const sortedFiles = content?.files?.sort((a, b) =>
    (a.name || '').localeCompare(b.name || ''),
  );

  const handleDownload = (path: string) => {
    window.open(getEducatorContentFileUrl(path), '_blank');
  };

  if (!content) return null;

  return (
    <BasicModal
      open={isOpen}
      onOpenChange={onClose}
      title={isUnpublishMode ? 'View content' : 'Review for approval'}
      contentClassName="max-w-xl md:max-w-3xl"
    >
      <div className="flex flex-col gap-6 text-left items-stretch w-full">
        {/* Main Content Info */}
        <div className="flex flex-col md:flex-row gap-4 items-center md:items-start text-center md:text-left">
          <div className="w-40 h-40 bg-gray-100 rounded-lg shrink-0 overflow-hidden border border-gray-100">
            {content.cover ? (
              <img
                src={getEducatorContentCoverUrl(content.cover) || ''}
                alt={content.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <span className="text-xs">No Cover</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 self-start text-start min-w-0 w-full">
            <h2 className="display-base md:display-large min-w-0 wrap-break-words">
              {content.title}
            </h2>
            <span className="body-small-bold text-neutral-800">
              {content.displayName}
            </span>
            <p className="body-small text-neutral-700 mt-1 min-w-0 wrap-break-words">
              {content.description}
            </p>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard
            label={t('educatorContent.detail.createdBy')}
            value={content.displayName ?? 'Unknown'}
            icon={TbUserCircle}
          />
          <StatCard
            label={t('words.category')}
            value={content.type ? capitalize(content.type) : 'Unknown'}
            icon={TbFile}
          />
          <StatCard
            label={t('words.language')}
            value={capitalize(getLanguageName(content.language))}
            icon={TbLanguage}
          />
        </div>
        {/* Files and Links List */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex flex-col divide-y divide-gray-100">
            {sortedLinks?.map((link) => (
              <div
                key={link.url}
                className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 transition-colors gap-4"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="body-small md:body-base decoration-orange-500 text-orange-500 underline truncate"
                >
                  {link.url}
                </a>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline shrink-0"
                >
                  <Button
                    variant="tertiary"
                    size={isMobile ? 's' : 'm'}
                    className="gap-4"
                  >
                    <span>{t('educatorContent.detail.view')}</span>
                    <TbExternalLink />
                  </Button>
                </a>
              </div>
            ))}
            {sortedFiles?.map((file) => (
              <div
                key={file.path}
                className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 transition-colors gap-4"
              >
                <span className="body-small md:body-base text-gray-700 truncate">
                  {file.name}
                </span>
                <Button
                  variant="tertiary"
                  size={isMobile ? 's' : 'm'}
                  className="gap-4 shrink-0"
                  onClick={() => handleDownload(file.path)}
                >
                  <span>{t('words.download')}</span>
                  <TbDownload />
                </Button>
              </div>
            ))}
          </div>
        </div>
        {/* Download All */}
        {content.files && content.files.length > 0 && (
          <div className="flex justify-end px-6 mt-4">
            <Button
              variant="primary"
              size={isMobile ? 's' : 'm'}
              onClick={() => {
                window.open(
                  `/api/educator-content/download-all/${content.id}`,
                  '_blank',
                );
              }}
            >
              <span>{t('educatorContent.detail.downloadAll')}</span>
            </Button>
          </div>
        )}
        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-2 w-full">
          <Button
            variant="tertiary"
            className="w-full justify-center"
            onClick={onEdit}
          >
            Edit
          </Button>

          {isUnpublishMode ? (
            <Button
              className="w-full justify-center bg-red-6 relative"
              onClick={onUnpublish}
              disabled={isUnpublishPending}
            >
              <span>Unpublish</span>
              <TbTrash className="absolute right-4 opacity-60" />
            </Button>
          ) : (
            <>
              <Button
                className="w-full justify-center bg-red-6 relative"
                onClick={onReject}
                disabled={isRejectPending}
              >
                <span>Reject</span>
                <TbTrash className="absolute right-4 opacity-60" />
              </Button>
              <Button
                className="w-full justify-center bg-green-600 relative"
                onClick={onApprove}
                disabled={isApprovePending}
              >
                <span>Approve content and publish</span>
                <TbCheck className="absolute right-4 opacity-60" />
              </Button>
            </>
          )}
        </div>
      </div>
    </BasicModal>
  );
};

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
    <div className="bg-neutral-50 rounded-2xl p-2 md:p-6 flex flex-col items-center justify-center text-center gap-3">
      <div className="flex items-center gap-2 text-gray-400">
        {Icon && <Icon className="size-4" />}
        <span className="caption-extra-small uppercase">{label}</span>
      </div>
      <span className="body-base-bold">{value}</span>
    </div>
  );
}
