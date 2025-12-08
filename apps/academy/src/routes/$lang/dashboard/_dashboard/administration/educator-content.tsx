import { EducatorContentStatus, EducatorContentType } from '@blms/constants';
import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogTitle,
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
import {
  TbAdjustmentsHorizontal,
  TbCheck,
  TbSearch,
  TbTrash,
  TbX,
} from 'react-icons/tb';

import { PageLayout } from '#src/components/page-layout.tsx';
import { SearchInput } from '#src/components/search-input.tsx';

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
  const [sortBy, setSortBy] = useState<'recent' | 'downloads'>('recent');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const handlePreview = (content: any) => {
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
    const filtered = publishedContent.filter((item) => {
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const matchesLanguage =
        selectedLanguage === 'all' || item.language === selectedLanguage;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesLanguage && matchesSearch;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === 'downloads') {
        return (b.downloads || 0) - (a.downloads || 0);
      }
      return 0;
    });
  }, [publishedContent, selectedType, selectedLanguage, searchQuery, sortBy]);

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
          className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100"
        >
          <div className="w-16 h-16 bg-gray-200 rounded mr-4 shrink-0 overflow-hidden flex items-center justify-center">
            {item.cover ? (
              <img
                src={getEducatorContentCoverUrl(item.cover) || ''}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-500">No Cover</span>
            )}
          </div>
          <div className="grow">
            <h3 className="font-semibold text-lg">{item.title}</h3>
            <div className="text-xs text-gray-400 mt-1 flex gap-2 capitalize">
              <span>{item.type}</span>
            </div>
          </div>
          <div>
            {isDraft ? (
              <Button
                variant="tertiary"
                size="s"
                onClick={() => handlePreview(item)}
              >
                {item.originalId ? 'Preview changes' : 'Preview for approval'}
              </Button>
            ) : (
              <Button
                variant="tertiary"
                size="s"
                onClick={() => handlePreview(item)}
              >
                Edit
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
        <h1 className="text-2xl font-bold">Review Educator Content</h1>

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

            <div className="flex w-full justify-end items-center gap-2 max-lg:hidden mb-6">
              <span className="text-sm text-gray-500">Sort by</span>
              <button
                type="button"
                onClick={() =>
                  setSortBy((prev) =>
                    prev === 'recent' ? 'downloads' : 'recent',
                  )
                }
                className="text-sm font-medium text-gray-900 hover:text-orange-500 transition-colors"
              >
                {sortBy === 'recent' ? 'Most Recent' : 'Most Downloaded'}
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {filteredPublishedContent &&
              filteredPublishedContent.length === 0 ? (
                <EmptyState
                  title={t('educatorContent.noResultsTitle')}
                  description={t('educatorContent.NoResultsDescription')}
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
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl p-6 bg-white rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <DialogTitle className="text-xl font-bold">
                Review for approval
              </DialogTitle>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {selectedContent && (
              <div className="border rounded-lg p-6 mb-6">
                <div className="flex gap-6">
                  <div className="w-48 h-48 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                    {selectedContent.cover && (
                      <img
                        src={
                          getEducatorContentCoverUrl(selectedContent.cover) ||
                          ''
                        }
                        alt={selectedContent.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="grow">
                    <h1 className="text-3xl font-bold mb-2">
                      {selectedContent.title}
                    </h1>
                    <p className="text-gray-600 mb-4">
                      {selectedContent.description}
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="text-xs text-gray-500 block">
                          LANGUAGE
                        </span>
                        <span className="font-medium capitalize">
                          {selectedContent.language}
                        </span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="text-xs text-gray-500 block">
                          TYPE
                        </span>
                        <span className="font-medium capitalize">
                          {selectedContent.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {selectedContent.files?.map((file: any) => (
                        <div
                          key={file.id}
                          className="flex justify-between items-center border p-3 rounded"
                        >
                          <span>{file.name}</span>
                          <Button
                            variant="outline"
                            size="s"
                            onClick={() => window.open(file.path, '_blank')}
                          >
                            Download
                          </Button>
                        </div>
                      ))}
                      {selectedContent.links?.map((link: any) => (
                        <div
                          key={link.id}
                          className="flex justify-between items-center border p-3 rounded"
                        >
                          <span>{link.label}</span>
                          <Button
                            variant="outline"
                            size="s"
                            onClick={() => window.open(link.url, '_blank')}
                          >
                            Open
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsPreviewOpen(false);
                  setIsEditModalOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                className="w-full bg-red-6 hover:bg-red-7 text-white"
                onClick={handleReject}
                disabled={rejectMutation.isPending}
              >
                <TbTrash className="mr-2" />
                Reject
              </Button>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={handleApprove}
                disabled={approveMutation.isPending}
              >
                <TbCheck className="mr-2" />
                Approve content and publish
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
