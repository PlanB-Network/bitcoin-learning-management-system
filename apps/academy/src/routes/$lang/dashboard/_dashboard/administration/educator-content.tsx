import { EducatorContentStatus } from '@blms/constants';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Loader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@blms/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { TbCheck, TbTrash } from 'react-icons/tb';

import { PageLayout } from '#src/components/page-layout.tsx';
import { getEducatorContentCoverUrl } from '#src/services/content.js';
import { trpc } from '#src/utils/trpc.js';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/educator-content',
)({
  component: AdminEducatorContent,
});

function AdminEducatorContent() {
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const ContentList = ({
    items,
    isDraft,
  }: {
    items: any[];
    isDraft: boolean;
  }) => (
    <div className="flex flex-col gap-4 mt-6">
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
                variant="outline"
                size="s"
                onClick={() => handlePreview(item)}
              >
                {item.originalId ? 'Preview changes' : 'Preview for approval'}
              </Button>
            ) : (
              <Button variant="outline" size="s" disabled>
                Approved
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

        <Tabs defaultValue="review" className="w-full">
          <TabsList className="w-full justify-start border-b border-gray-200 bg-transparent p-0">
            <TabsTrigger
              value="review"
              className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 rounded-none px-4 py-2"
            >
              To review
              {draftContent && draftContent.length > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                  {draftContent.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 rounded-none px-4 py-2"
            >
              Approved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review">
            {isLoadingDraft ? (
              <Loader />
            ) : (
              <div className="flex flex-col gap-8">
                {/* New Content Section */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <h2 className="text-xl font-semibold">New</h2>
                  </div>
                  <ContentList
                    items={
                      draftContent?.filter((item) => !item.originalId) || []
                    }
                    isDraft={true}
                  />
                </div>

                {/* Modified Content Section */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <h2 className="text-xl font-semibold">Modified</h2>
                  </div>
                  <ContentList
                    items={
                      draftContent?.filter((item) => item.originalId) || []
                    }
                    isDraft={true}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {isLoadingPublished ? (
              <Loader />
            ) : (
              <ContentList items={publishedContent || []} isDraft={false} />
            )}
          </TabsContent>
        </Tabs>

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
                onClick={() => setIsPreviewOpen(false)}
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
      </div>
    </PageLayout>
  );
}
