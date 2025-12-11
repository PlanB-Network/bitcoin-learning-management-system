import { EducatorContentStatus, EducatorContentType } from '@blms/constants';
import {
  Button,
  cn,
  DropdownMenu,
  EmptyState,
  Loader,
  SegmentedControl,
  SegmentedControlItem,
} from '@blms/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { capitalize } from 'lodash-es';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbAdjustmentsHorizontal, TbSearch, TbX } from 'react-icons/tb';

import { PageLayout } from '#src/components/page-layout.tsx';
import { SearchInput } from '#src/components/search-input.tsx';
import { ReviewModal } from '#src/routes/$lang/dashboard/_dashboard/administration/-components/review-modal.tsx';
import { EducatorContentModal } from '#src/routes/$lang/educator-content/-components/educator-content-modal.tsx';
import { getEducatorContentCoverUrl } from '#src/services/content.js';
import { getLanguageName, LANGUAGES } from '#src/utils/i18n.ts';
import { trpc } from '#src/utils/trpc.js';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/educator-content',
)({
  component: AdminEducatorContent,
});

function AdminEducatorContent() {
  const { t } = useTranslation();

  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('review');

  // Filters state
  const [selectedType, setSelectedType] = useState<EducatorContentType | 'all'>(
    'all',
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isUnpublishMode, setIsUnpublishMode] = useState(false);

  const { data: draftContent, isLoading: isLoadingDraft } = useQuery(
    trpc.content.getEducatorContents.queryOptions({
      status: EducatorContentStatus.Draft,
    }),
  );

  const { data: publishedContent, isLoading: isLoadingPublished } = useQuery(
    trpc.content.getEducatorContents.queryOptions({
      status: EducatorContentStatus.Published,
    }),
  );

  const queryClient = useQueryClient();

  const approveMutation = useMutation(
    trpc.content.approveEducatorContent.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.content.getEducatorContents.queryKey(),
        });
        setIsPreviewOpen(false);
      },
    }),
  );

  const rejectMutation = useMutation(
    trpc.content.rejectEducatorContent.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.content.getEducatorContents.queryKey(),
        });
        setIsPreviewOpen(false);
      },
    }),
  );

  const unpublishMutation = useMutation(
    trpc.content.unpublishEducatorContent.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.content.getEducatorContents.queryKey(),
        });
        setIsPreviewOpen(false);
      },
    }),
  );

  const handlePreview = (content: any, isDraft: boolean) => {
    setIsUnpublishMode(!isDraft);
    setSelectedContent(content);
    setIsPreviewOpen(true);
  };

  const handleApprove = () => {
    if (selectedContent) {
      approveMutation.mutate({ id: String(selectedContent.id) });
    }
  };

  const handleReject = () => {
    if (selectedContent) {
      rejectMutation.mutate({ id: String(selectedContent.id) });
    }
  };

  const handleUnpublish = () => {
    if (selectedContent) {
      unpublishMutation.mutate({ id: String(selectedContent.id) });
    }
  };

  const newContent = useMemo(
    () => draftContent?.filter((item) => !item.originalId) || [],
    [draftContent],
  );

  const modifiedContent = useMemo(
    () => draftContent?.filter((item) => item.originalId) || [],
    [draftContent],
  );

  const filteredPublishedContent = useMemo(() => {
    if (!publishedContent) return [];
    return publishedContent.filter((item) => {
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const matchesLanguage =
        selectedLanguage === 'all' || item.language === selectedLanguage;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesLanguage && matchesSearch;
    });
  }, [publishedContent, selectedType, selectedLanguage, searchQuery]);

  const types = [
    {
      id: 'all',
      name: 'All',
      onClick: () => setSelectedType('all'),
    },
    ...Object.values(EducatorContentType).map((type) => ({
      id: type,
      name: capitalize(type),
      onClick: () => setSelectedType(type),
    })),
  ];

  const languages = [
    {
      id: 'all',
      name: 'All',
      onClick: () => setSelectedLanguage('all'),
    },
    ...LANGUAGES.map((lang) => ({
      id: lang,
      name: capitalize(getLanguageName(lang)),
      onClick: () => setSelectedLanguage(lang),
    })),
  ];

  const ContentList = ({
    items,
    isDraft,
  }: {
    items: any[];
    isDraft: boolean;
  }) => (
    <div className="flex flex-col gap-4">
      {items?.map((item) => (
        <div
          key={item.id}
          className="flex items-center p-4 bg-white rounded-lg border border-gray-100"
        >
          <div className="w-16 h-16 bg-gray-200 rounded mr-4 shrink-0 overflow-hidden flex items-center justify-center">
            {item.cover ? (
              <img
                src={getEducatorContentCoverUrl(item.cover) || ''}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-500">
                {t('educatorContent.noCover')}
              </span>
            )}
          </div>
          <div className="grow">
            <h3 className="font-semibold text-lg">{item.title}</h3>
          </div>
          <div>
            {isDraft ? (
              <Button
                variant="tertiary"
                size="s"
                onClick={() => handlePreview(item, isDraft)}
              >
                {item.originalId ? 'Preview changes' : 'Preview for approval'}
              </Button>
            ) : (
              <Button
                variant="tertiary"
                size="s"
                onClick={() => handlePreview(item, isDraft)}
              >
                {t('words.open')}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <PageLayout title="Review Educator Content" layoutSize="wide">
      <div className="w-full flex flex-col gap-6">
        <SegmentedControl
          variant="outline"
          value={currentTab}
          onValueChange={setCurrentTab}
          className="w-full"
        >
          <SegmentedControlItem value="review" className="w-full">
            To review
            {draftContent && draftContent.length > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                {draftContent.length}
              </span>
            )}
          </SegmentedControlItem>
          <SegmentedControlItem value="approved" className="w-full">
            Approved
          </SegmentedControlItem>
        </SegmentedControl>

        {currentTab === 'review' ? (
          isLoadingDraft ? (
            <Loader />
          ) : (
            <div className="flex flex-col gap-8">
              {!newContent.length && !modifiedContent.length && (
                <EmptyState title={t('educatorContent.noContentToReview')} />
              )}
              {/* New Content Section */}
              {newContent.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <h2 className="title-medium">New</h2>
                  </div>
                  <ContentList items={newContent} isDraft={true} />
                </div>
              )}

              {/* Modified Content Section */}
              {modifiedContent.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <h2 className="title-medium">Modified</h2>
                  </div>
                  <ContentList items={modifiedContent} isDraft={true} />
                </div>
              )}
            </div>
          )
        ) : isLoadingPublished ? (
          <Loader />
        ) : (
          <>
            {/* Mobile Search filter */}
            <div
              className={cn(
                'flex items-center gap-2 w-full justify-end my-2 mb-6 lg:hidden',
              )}
            >
              <SearchInput
                searchTerm={searchQuery}
                setSearchTerm={setSearchQuery}
              />
              <button
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="p-2 rounded-lg bg-neutral-50 text-neutral-400 flex items-center gap-2"
                type="button"
              >
                <span className="body-base">{t('words.filters')}</span>
                {isFilterOpen ? (
                  <TbX size={16} />
                ) : (
                  <TbAdjustmentsHorizontal size={16} />
                )}
              </button>
            </div>

            {/* Filters */}
            <div
              className={cn(
                'lg:ml-auto flex max-lg:flex-col gap-1 lg:gap-2 lg:max-w-190 lg:w-full',
                'max-lg:p-2 max-lg:rounded-lg max-lg:w-full max-lg:max-w-90',
                'max-lg:mx-auto lg:mt-4 mt-8 mb-8',
                isFilterOpen ? '' : 'max-lg:hidden',
              )}
            >
              <div className="lg:hidden flex justify-between items-center w-full mb-1 px-1">
                <span className="body-small-bold text-neutral-700">
                  {t('words.filters')}
                </span>
              </div>
              <DropdownMenu
                activeItem={
                  types.find((t) => t.id === selectedType)?.name || 'Type'
                }
                itemsList={types.filter((t) => t.id !== selectedType)}
                variant="light"
                placeholder="Type"
                forcePlaceholder={selectedType === 'all'}
              />
              <DropdownMenu
                activeItem={
                  languages.find((l) => l.id === selectedLanguage)?.name ||
                  'Language'
                }
                itemsList={languages.filter((l) => l.id !== selectedLanguage)}
                variant="light"
                placeholder="Language"
                forcePlaceholder={selectedLanguage === 'all'}
              />
              <SearchInput
                searchTerm={searchQuery}
                setSearchTerm={setSearchQuery}
                className="max-lg:hidden"
              />
            </div>

            <div className="flex flex-col gap-3">
              {filteredPublishedContent &&
              filteredPublishedContent.length === 0 ? (
                <EmptyState
                  title={t('educatorContent.noResultsTitle')}
                  description={t('educatorContent.noResultsDescription')}
                  icon={TbSearch}
                />
              ) : null}
              <ContentList
                items={filteredPublishedContent || []}
                isDraft={false}
              />
            </div>
          </>
        )}

        {/* Preview Modal */}
        <ReviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          content={selectedContent}
          onApprove={handleApprove}
          onReject={handleReject}
          onUnpublish={handleUnpublish}
          isUnpublishMode={isUnpublishMode}
          onEdit={() => {
            setIsPreviewOpen(false);
            setIsEditModalOpen(true);
          }}
          isApprovePending={approveMutation.isPending}
          isRejectPending={rejectMutation.isPending}
          isUnpublishPending={unpublishMutation.isPending}
        />

        {/* Edit Modal */}
        {selectedContent && (
          <EducatorContentModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            initialData={selectedContent}
            isAdmin={true}
          />
        )}
      </div>
    </PageLayout>
  );
}
