import { cn, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { useContext, useMemo } from 'react';
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

  const sortedContent = useMemo(() => {
    if (!content) return [];
    const statusOrder: Record<string, number> = {
      draft: 0,
      published: 1,
      rejected: 2,
      unpublished: 3,
    };

    return [...content].sort((a, b) => {
      const orderA = statusOrder[a.status] ?? 99;
      const orderB = statusOrder[b.status] ?? 99;
      return orderA - orderB;
    });
  }, [content]);

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
      case 'unpublished':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return t('educatorContent.status.published');
      case 'draft':
        return t('educatorContent.status.draft');
      case 'rejected':
        return t('educatorContent.status.rejected');
      case 'unpublished':
        return t('educatorContent.status.unpublished');
      default:
        return status;
    }
  };

  return (
    <PageLayout
      title="My content"
      layoutSize="base"
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
          <p className="text-lg mb-4">{t('educatorContent.loginMessage')}</p>
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
          {sortedContent?.map((item) => (
            <Link
              to="/$lang/educator-content/$id"
              params={{ lang: i18n.language, id: item.id }}
              key={item.id}
              className="flex w-full justify-between gap-2 md:gap-6 items-center pr-4 bg-white rounded-2xl hover:bg-neutral-50 cursor-pointer"
            >
              <div className="flex gap-3 md:gap-6 items-center">
                {/* Thumbnail */}
                <div className="w-28 h-21 md:w-32 md:h-24 bg-gray-200 rounded-lg md:rounded-2xl shrink-0 overflow-hidden flex items-center justify-center">
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

                {/* Content */}
                <div className="grow flex flex-col justify-center gap-2">
                  <h3 className="title-small md:title-base text-gray-900">
                    {item.title}
                  </h3>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium lg:hidden',
                        getStatusColor(item.status),
                      )}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                    <TbDownload size={16} />
                    <span>{item.downloads}</span>
                  </div>
                </div>
              </div>

              <div className="flex">
                {/* Status */}
                <div className="mr-4 max-lg:hidden">
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
                <TbChevronRight
                  className="text-neutral-300 shrink-0"
                  size={isMobile ? 16 : 24}
                />
              </div>
            </Link>
          ))}
          {content?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {t('educatorContent.noContent')}
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
