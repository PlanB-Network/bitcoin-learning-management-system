import { cn, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { TbChevronRight, TbDownload } from 'react-icons/tb';
import { AuthModal } from '#src/components/AuthModals/auth-modal.tsx';
import { PageLayout } from '#src/components/page-layout.tsx';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.tsx';
import { getEducatorContentCoverUrl } from '#src/services/content.js';
import { trpc } from '#src/utils/trpc.js';
import { EducatorContentModal } from './-components/educator-content-modal.tsx';

export const Route = createFileRoute('/$lang/educator-content/my-content')({
  component: MyContent,
});

function MyContent() {
  useParams({ strict: false });
  const { i18n, t } = useTranslation();
  const { session } = useContext(AppContext);
  const isLoggedIn = !!session?.user;

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  const {
    open: openAddContentModal,
    isOpen: isAddContentModalOpen,
    close: closeAddContentModal,
  } = useDisclosure();

  const { data: content, isLoading } = useQuery(
    trpc.content.getEducatorContents.queryOptions(
      {
        uid: session?.user?.uid,
      },
      {
        enabled: isLoggedIn,
      },
    ),
  );

  const isMobile = useSmaller('lg');

  const handleAddContentClick = () => {
    if (isLoggedIn) {
      openAddContentModal();
    } else {
      openAuthModal();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-600';
      case 'pending':
        return 'bg-gray-100 text-gray-600';
      case 'rejected':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Live';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Not accepted';
      default:
        return status;
    }
  };

  return (
    <PageLayout
      title="My content"
      layoutSize="wide"
      actionButtons={[
        {
          text: t('educatorContent.addMaterial'),
          onClick: handleAddContentClick,
        },
      ]}
      tabs={[
        {
          id: 'educator-content',
          label: t('menu.educatorContent'),
          href: '/educator-content',
        },
        {
          id: 'my-content',
          label: t('educatorContent.myContent'),
          href: '/educator-content/my-content',
        },
      ]}
    >
      {!isLoggedIn ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg mb-4">Please log in to view your content.</p>
          <button
            type="button"
            onClick={openAuthModal}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            {t('menu.login')}
          </button>
        </div>
      ) : isLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-4 mt-6">
          {content?.map((item) => (
            <Link
              to="/$lang/educator-content/$id"
              params={{ lang: i18n.language, id: item.id }}
              key={item.id}
              className="flex gap-2 md:gap-6 items-center pr-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="w-48 h-24 bg-gray-200 rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
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
              {/* Content */}
              <div className="grow flex flex-col justify-center gap-2">
                <h3 className="font-semibold text-xl text-gray-900">
                  {item.title}
                </h3>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <TbDownload size={16} />
                  <span>{item.downloads}</span>
                </div>
              </div>
              {/* Status */}
              <div className="mr-4">
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    getStatusColor(item.status),
                  )}
                >
                  {getStatusLabel(item.status)}
                </span>
              </div>
              {/* Arrow */}
              <div className="text-neutral-300">
                <TbChevronRight size={isMobile ? 16 : 24} />
              </div>
            </Link>
          ))}
          {content?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              You haven't uploaded any content yet.
            </div>
          )}
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      <EducatorContentModal
        isOpen={isAddContentModalOpen}
        onClose={closeAddContentModal}
      />
    </PageLayout>
  );
}
