import { formatNameForURL } from '@blms/shared';
import type { GetTutorialResponse, JoinedProofreading } from '@blms/types';
import { cn, customToast, DividerSimple, Image, Loader } from '@blms/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import React, { memo, useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { TbCalendarCheck, TbCheck } from 'react-icons/tb';
import { z } from 'zod';
import ThumbDown from '#src/assets/icons/thumb_down.svg';
import ThumbUp from '#src/assets/icons/thumb_up.svg';
import { AuthModal } from '#src/components/AuthModals/auth-modal.js';
import { AuthModalState } from '#src/components/AuthModals/props.js';
import { AuthorCard } from '#src/components/author-card.tsx';
import { PageLayout } from '#src/components/page-layout.tsx';
import { professorHasTipsAvailable } from '#src/components/professor-card.tsx';
import { ProofreadingDesktop } from '#src/components/proofreading-progress.js';
import { useDisclosure } from '#src/hooks/use-disclosure.js';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.ts';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.js';
import { getNameAndIdFromUrl } from '#src/services/utils.tsx';
import { formatDate } from '#src/utils/date.ts';
import { cdnUrl, resourceImgUrl } from '#src/utils/index.ts';
import { trpc } from '#src/utils/trpc.js';
import { TutorialLikes } from '../-components/tutorial-likes.tsx';
import TutorialWithTOC from '../-components/tutorial-toc.tsx';

export const Route = createFileRoute(
  '/$lang/tutorials/$category/$subcategory/$name-$id',
)({
  component: TutorialDetails,
  params: {
    parse: (params) => {
      const nameId = params['name-$id'];
      const { id, name } = getNameAndIdFromUrl(nameId);

      return {
        category: z.string().parse(params.category),
        id: z.string().parse(id),
        lang: z.string().parse(params.lang),
        name: z.string().parse(name),
        'name-$id': nameId,
        subcategory: z.string().parse(params.subcategory),
      };
    },
    stringify: ({ lang, name, id, category, subcategory }) => ({
      category: category,
      lang: lang,
      'name-$id': `${name}-${id}`,
      subcategory: subcategory,
    }),
  },
});

const Header = ({ tutorial }: { tutorial: GetTutorialResponse }) => {
  const isMobile = useSmaller('md');

  const totalLikesDislikes = tutorial.likeCount + tutorial.dislikeCount;

  return (
    <div className="flex flex-col w-full">
      <h1 className="display-base md:display-medium">{tutorial.title}</h1>

      <section className="flex items-center max-md:justify-between w-full gap-10 mt-2">
        {tutorial.professor?.name && (
          <a
            href={`/professor/${formatNameForURL(tutorial.professor?.name)}-${tutorial.professor?.id}`}
            className="flex items-center gap-2 shrink-0 body-small-bold md:body-base-bold"
          >
            <Image
              src={resourceImgUrl(tutorial.professor, 'profile.webp')}
              alt={tutorial.professor.name}
              width={16}
              height={16}
              breakpoints={{ default: 64 }}
              className={cn(
                'size-4 rounded-full object-cover [overflow-clip-margin:_unset]',
              )}
            />
            {tutorial.professor?.name}
          </a>
        )}
        <div className="flex items-center gap-2 text-neutral-600 max-md:hidden">
          <TbCalendarCheck size={16} />
          <span className="body-base">{formatDate(tutorial.lastUpdated)}</span>
        </div>
        {totalLikesDislikes >= 10 ? (
          <TutorialLikes
            tutorial={tutorial}
            isMobile={isMobile ?? undefined}
            className="shrink-0"
          />
        ) : null}
      </section>

      {/* Last update */}
      {/* <div className="flex items-center gap-2 text-neutral-600 md:hidden mt-1">
        <TbCalendarCheck size={16} />
        <span className="body-small">{formatDate(tutorial.lastUpdated)}</span>
      </div> */}
    </div>
  );
};

const AuthorDetails = ({ tutorial }: { tutorial: GetTutorialResponse }) => {
  const author = tutorial?.professor;

  return (
    <>
      <DividerSimple variant="brown" />
      <section className="w-full flex flex-col">
        <h4 className="subtitle-medium-caps-18px text-orange-500">
          {t('words.author')}
        </h4>
        <p className="mt-4 md:mt-6 label-large-20px md:display-small-32px text-black">
          {t('tutorials.writtenBy')}{' '}
          <span className="text-orange-500 label-large-20px md:display-small-32px">
            <Link
              to={`/professor/${formatNameForURL(author?.name || '')}-${author?.id}`}
              className="hover:text-orange-500 hover:font-medium"
            >
              {author?.name}
            </Link>
          </span>
        </p>
        {author && professorHasTipsAvailable(author) ? (
          <p className="md:mt-6 text-neutral-1000 md:text-justify body-16px md:label-large-20px max-md:hidden">
            {t('courses.details.thanksTipping')}
          </p>
        ) : null}
        {author && (
          <div className="flex h-fit flex-col max-md:gap-4">
            <AuthorCard
              key={author?.id}
              professor={author}
              hasDonateButton
              centeredContent={true}
              mobileSize="medium"
            />
          </div>
        )}
      </section>
    </>
  );
};

const Credits = ({
  tutorial,
  proofreading,
}: {
  tutorial: GetTutorialResponse;
  proofreading: JoinedProofreading | null | undefined;
}) => {
  const { i18n } = useTranslation();

  const isOriginalLanguage = i18n.language === tutorial.originalLanguage;
  if (!proofreading) {
    return null;
  }

  return (
    <>
      <DividerSimple variant="brown" />
      <section className="w-full flex flex-col">
        <h4 className="subtitle-medium-caps-18px text-orange-500">
          {t('words.credits')}
        </h4>

        <p className="mt-4 md:mt-6 label-large-20px md:display-small-32px text-black">
          {proofreading?.contributorNames?.length > 0
            ? t('tutorials.hasBeenProofreadBy')
            : t('tutorials.hasNotBeenProofread')}
          <span className="text-orange-500 label-large-20px md:display-small-32px">
            {' '}
            {proofreading?.contributorNames?.length > 0
              ? proofreading.contributorNames.map((proofreader, index) => (
                  <React.Fragment key={proofreader}>
                    <span>{proofreader}</span>
                    {index < proofreading.contributorNames.length - 2
                      ? ', '
                      : index === proofreading.contributorNames.length - 2
                        ? ' & '
                        : ''}
                  </React.Fragment>
                ))
              : ''}
          </span>
        </p>

        <div className="flex flex-col md:flex-row gap-6 lg:gap-12 mt-6 md:mt-7">
          <div className="max-md:mx-auto shrink-0">
            <ProofreadingDesktop
              isOriginalLanguage={isOriginalLanguage}
              mode="light"
              proofreadingData={{
                contributors: proofreading?.contributorNames || [],
                reward: proofreading?.reward,
              }}
              standalone
              variant="vertical"
            />
          </div>
          <p className="md:mb-8 text-neutral-1000 md:text-justify body-16px md:subtitle-medium-16px whitespace-pre-line">
            <Trans i18nKey={'courses.details.collaborativeEffort'}>
              <a
                className="hover:text-orange-500 font-medium"
                href="https://t.me/PlanBNetwork_ContentBuilder"
                target="_blank"
                rel="noreferrer"
              >
                telegram
              </a>
              <Link
                to="/tutorials/contribution/content/proofreading-review-tutorial-28236c98-23b2-4efd-9563-953f08707017"
                className="hover:text-orange-500 font-medium"
                target="_blank"
                rel="noreferrer"
              >
                tutorial
              </Link>
              <a
                className="hover:text-orange-500 font-medium"
                href="https://creativecommons.org/licenses/by-sa/4.0/deed.en"
                target="_blank"
                rel="noreferrer"
              >
                CC BY-SA
              </a>
            </Trans>
          </p>
        </div>
      </section>
    </>
  );
};

function TutorialDetails() {
  const { i18n } = useTranslation();
  const params = Route.useParams();
  const id = params.id;
  const navigate = useNavigate();
  const { navigateTo404 } = useNavigateMisc();

  // States
  const [isLiked, setIsLiked] = useState({ disliked: false, liked: false });

  const [likesCounts, setLikesCounts] = useState({
    dislikeCount: 0,
    likeCount: 0,
  });

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  // Access global context
  const { session } = useContext(AppContext);
  const authMode = AuthModalState.SignIn;
  const isLoggedIn = !!session;

  // Fetch tutorial data
  const { data: tutorial, isFetched } = useQuery(
    trpc.content.getTutorial.queryOptions(
      {
        id,
        language: i18n.language,
      },
      {
        refetchOnWindowFocus: false,
      },
    ),
  );

  // Rewrite URL
  useEffect(() => {
    if (
      tutorial &&
      (params.name !== formatNameForURL(tutorial.name) ||
        params.category !== formatNameForURL(tutorial.category) ||
        params.subcategory !== formatNameForURL(tutorial.subcategory ?? ''))
    ) {
      navigate({
        replace: true,
        to: `/tutorials/${formatNameForURL(tutorial.category)}/${formatNameForURL(tutorial.subcategory || '')}/${formatNameForURL(tutorial.name)}-${tutorial.id}`,
      });
    }
  }, [
    tutorial,
    params.category,
    params.name,
    params.subcategory,
    navigate,
    navigateTo404,
  ]);

  // Fetch existing like/dislike status
  const { data: existingLike } = useQuery(
    trpc.user.tutorials.getExistingLikeTutorial.queryOptions(
      {
        id: tutorial?.id || '',
      },
      { enabled: !!tutorial?.id && isLoggedIn },
    ),
  );

  const { data: proofreading } = useQuery(
    trpc.content.getProofreading.queryOptions(
      {
        language: i18n.language,
        tutorialId: tutorial?.id,
      },
      { enabled: !!tutorial?.id },
    ),
  );

  // Mutation for liking/disliking a tutorial
  const likeTutorialMutation = useMutation(
    trpc.user.tutorials.likeTutorial.mutationOptions({
      onSuccess: (_, variables) => {
        const wasLiked = isLiked.liked;
        const wasDisliked = isLiked.disliked;

        if (
          (wasLiked && variables.liked) ||
          (wasDisliked && !variables.liked)
        ) {
          customToast(t('tutorials.details.ratingSuccess'), {
            closeButton: true,
            color: 'success',
            icon: TbCheck,
            mode: 'light',
            time: 5000,
          });
        }
      },
    }),
  );

  // Update tutorial likes when fetched tutorial change
  useEffect(() => {
    if (tutorial) {
      setLikesCounts({
        dislikeCount: tutorial.dislikeCount,
        likeCount: tutorial.likeCount,
      });
    }
  }, [tutorial]);

  // Update existing like when fetched
  useEffect(() => {
    setIsLiked(existingLike || { disliked: false, liked: false });
  }, [existingLike]);

  // Like/dislike buttons component
  const LikeDislikeButtons = () => {
    // Handler functions for like and dislike buttons
    const handleLike = () => {
      if (!tutorial) return;

      likeTutorialMutation.mutate({ id: tutorial.id, liked: true });
      setIsLiked((prev) => ({
        disliked: false,
        liked: !prev.liked,
      }));
      setLikesCounts((prev) => {
        return {
          dislikeCount: isLiked.disliked
            ? prev.dislikeCount - 1
            : prev.dislikeCount,
          likeCount: isLiked.liked ? prev.likeCount - 1 : prev.likeCount + 1,
        };
      });
    };

    const handleDislike = () => {
      if (!tutorial) return;

      likeTutorialMutation.mutate({
        id: tutorial.id,
        liked: false,
      });
      setIsLiked((prev) => ({
        disliked: !prev.disliked,
        liked: false,
      }));
      setLikesCounts((prev) => {
        return {
          dislikeCount: isLiked.disliked
            ? prev.dislikeCount - 1
            : prev.dislikeCount + 1,
          likeCount: isLiked.liked ? prev.likeCount - 1 : prev.likeCount,
        };
      });
    };

    return (
      <div className="flex flex-col items-center justify-center gap-2 md:gap-4 w-full rounded-[30px] px-2 py-4 border border-neutral-100 text-black max-md:mt-8 max-md:mb-2 md:my-16">
        {isFetched && tutorial && (
          <>
            <span className="title-medium text-center text-neutral-1000">
              {t('tutorials.details.didThisWork')}
            </span>
            <div className="flex items-center justify-between py-2.5 gap-6 md:gap-10">
              <div className="flex flex-col gap-2 items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    isLoggedIn ? handleLike() : openAuthModal();
                  }}
                  className={cn(
                    'py-3.5 px-4 rounded-xl border border-green-400 focus:border-green-700',
                    isLiked.liked
                      ? 'bg-green-50'
                      : 'hover:bg-green-50 bg-white',
                  )}
                >
                  <img src={ThumbUp} alt="" className="size-12" />
                </button>
                <span className="body-extra-large-bold text-green-400">
                  {likesCounts.likeCount}
                </span>
              </div>
              <div className="flex flex-col gap-2 items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    isLoggedIn ? handleDislike() : openAuthModal();
                  }}
                  className={cn(
                    'py-3.5 px-4 rounded-xl border border-red-400 focus:border-red-600',
                    isLiked.disliked ? 'bg-red-50' : 'hover:bg-red-50 bg-white',
                  )}
                >
                  <img
                    src={ThumbDown}
                    alt=""
                    className="size-12 -scale-x-100"
                  />
                </button>
                <span className="body-extra-large-bold text-red-400">
                  {likesCounts.dislikeCount}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <PageLayout
      layoutSize="wide"
      backLink={{
        text: `${t(`tutorials.${params.category}.title`)}`,
        href: `/tutorials/${params.category}#${params.subcategory}`,
      }}
      title={tutorial?.title ?? undefined}
      hideTitle
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !tutorial && (
        <div className="flex flex-col text-black">
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.tutorial'),
          })}
        </div>
      )}
      {tutorial && (
        <>
          <div className="flex w-full flex-col items-center justify-center gap-2 md:gap-4">
            <Header
              tutorial={{
                ...tutorial,
                dislikeCount: likesCounts.dislikeCount,
                likeCount: likesCounts.likeCount,
              }}
            />
            <div className="w-full flex flex-col gap-5 md:gap-7 text-neutral-1000">
              <MarkdownContent tutorial={tutorial} />
              <LikeDislikeButtons />
              {tutorial.creditLink && (
                <span className="w-full flex flex-col gap-4 subtitle-medium-caps-18px subtitle-small-caps-14px text-orange-500 mx-auto">
                  {t('tutorials.details.source')}
                  <a
                    href={tutorial.creditLink}
                    target="_blank"
                    rel="noreferrer"
                    className="leading-snug tracking-015px underline text-blue-500 break-words lowercase max-w-full truncate"
                  >
                    {tutorial.creditLink}
                  </a>
                </span>
              )}
              {tutorial.professor?.id && <AuthorDetails tutorial={tutorial} />}
              <Credits tutorial={tutorial} proofreading={proofreading} />
            </div>
          </div>

          {isAuthModalOpen && (
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={closeAuthModal}
              initialState={authMode}
            />
          )}
        </>
      )}
    </PageLayout>
  );
}

const MarkdownContent = memo(
  ({ tutorial }: { tutorial: GetTutorialResponse }) => {
    return (
      <TutorialWithTOC
        rawContent={tutorial.rawContent}
        assetPrefix={cdnUrl(tutorial.path)}
      />
    );
  },
);
