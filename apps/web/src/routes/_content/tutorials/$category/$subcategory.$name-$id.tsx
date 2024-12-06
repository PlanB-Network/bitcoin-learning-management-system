import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import { capitalize } from 'lodash-es';
import React, { Suspense, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Loader, cn } from '@blms/ui';

import DonateLightning from '#src/assets/icons/donate_lightning.svg?react';
import ThumbDown from '#src/assets/icons/thumb_down.svg';
import ThumbUp from '#src/assets/icons/thumb_up.svg';
// import ApprovedBadge from '#src/assets/tutorials/approved.svg?react';
import { AuthModal } from '#src/components/AuthModals/auth-modal.js';
import { AuthModalState } from '#src/components/AuthModals/props.js';
import PageMeta from '#src/components/Head/PageMeta/index.js';
import { MainLayout } from '#src/components/main-layout.tsx';
import { ProfessorCardReduced } from '#src/components/professor-card.tsx';
import { ProofreadingProgress } from '#src/components/proofreading-progress.js';
import { TipModal } from '#src/components/tip-modal.js';
import { useDisclosure } from '#src/hooks/use-disclosure.js';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.ts';
import { AppContext } from '#src/providers/context.js';
import { cdnUrl } from '#src/utils/index.js';
import { SITE_NAME } from '#src/utils/meta.js';
import { formatNameForURL } from '#src/utils/string.js';
import { type TRPCRouterOutput, trpc } from '#src/utils/trpc.js';

import { TutorialLayout } from '../-components/tutorial-layout.tsx';
import { TutorialLikes } from '../-components/tutorial-likes.tsx';

// eslint-disable-next-line import/no-named-as-default-member
const TutorialsMarkdownBody = React.lazy(
  () => import('#src/components/Markdown/tutorials-markdown-body.js'),
);

export const Route = createFileRoute(
  '/_content/tutorials/$category/$subcategory/$name-$id',
)({
  params: {
    parse: (params) => {
      const nameId = params['name-$id'];
      // Extract the id from the name (36 chars since id is an uuid)
      const id = nameId.slice(-36);
      const name = nameId.slice(0, -37);

      return {
        'name-$id': nameId,
        name: z.string().parse(name),
        id: z.string().parse(id),
        category: z.string().parse(params.category),
        subcategory: z.string().parse(params.subcategory),
      };
    },
    stringify: ({ name, id, category, subcategory }) => ({
      category: category,
      subcategory: subcategory,
      'name-$id': `${name}-${id}`,
    }),
  },
  component: TutorialDetails,
});

const Header = ({
  tutorial,
}: {
  tutorial: NonNullable<TRPCRouterOutput['content']['getTutorial']>;
}) => {
  return (
    <div>
      <h1 className="border-b-2 border-newBlack-3 py-2.5 text-left text-2xl font-bold uppercase text-newBlack-1 md:text-5xl leading-[116%] stroke-[#D9D9D9] stroke-1">
        {tutorial.title}
      </h1>

      <section className="flex flex-col gap-1 bg-newGray-6 rounded-lg p-2.5 w-full border-b border-newGray-4 shadow-course-navigation mt-5 break-words">
        {tutorial.credits?.link && (
          <span className="body-16px text-black">
            {t('tutorials.details.source')}
            <a
              href={tutorial.credits.link}
              target="_blank"
              rel="noreferrer"
              className="leading-snug tracking-015px underline text-newBlue-1"
            >
              {tutorial.credits.link}
            </a>
          </span>
        )}
        {tutorial.credits?.professor?.name && (
          <span className="body-16px text-black">
            {t('tutorials.details.author')}
            <a
              href={`/professor/${formatNameForURL(tutorial.credits.professor.name)}-${tutorial.credits.professor.id}`}
              className="title-small-med-16px hover:underline"
            >
              {tutorial.credits.professor.name}
            </a>
          </span>
        )}
        <div className="flex max-md:flex-wrap justify-center md:justify-between py-2.5 items-center gap-2">
          <TutorialLikes tutorial={tutorial} />
          {/* <p className="flex items-center gap-2 text-xs italic font-poppins text-right text-darkGreen-1">
            {t('tutorials.approvedByCreator')}{' '}
            <ApprovedBadge className="size-[18px]" />
          </p> */}
        </div>
      </section>
    </div>
  );
};
{
  /* eslint-disable tailwindcss/no-contradicting-classname */
}

const AuthorDetails = ({
  tutorial,
  openTipModal,
}: {
  tutorial: NonNullable<TRPCRouterOutput['content']['getTutorial']>;
  openTipModal: () => void;
}) => {
  const professor = tutorial?.credits?.professor;

  return (
    <article className="flex flex-col p-2 md:p-7 gap-5 rounded-2xl border-t border-t-newGray-4 bg-newGray-6 shadow-course-navigation mt-8">
      <span className="label-normal-16px md:label-large-20px font-medium text-newBlack-1 w-full max-md:text-center">
        {t('tutorials.details.writtenBy')}
      </span>
      <div className="flex max-md:flex-col max-md:gap-4 md:items-end gap-7">
        {professor && <ProfessorCardReduced professor={professor} />}
        <div className="flex items-center gap-4">
          <button
            className="flex items-center justify-center p-1 rounded-2xl bg-white shadow-course-navigation border border-darkOrange-2 overflow-hidden size-16 hover:bg-darkOrange-0 shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openTipModal();
            }}
          >
            <DonateLightning className="size-16" />
          </button>
          <div className="title-small-med-16px text-black whitespace-pre-line">
            {t('courses.chapter.thanksTip')}
          </div>
        </div>
      </div>
    </article>
  );
};

function TutorialDetails() {
  const { i18n } = useTranslation();
  const params = Route.useParams();
  console.log(params);
  const id = params.id;
  const navigate = useNavigate();
  const { navigateTo404 } = useNavigateMisc();

  // States
  const [isLiked, setIsLiked] = useState({ liked: false, disliked: false });

  const [likesCounts, setLikesCounts] = useState({
    likeCount: 0,
    dislikeCount: 0,
  });

  // Disclosure (modals)
  const {
    open: openTipModal,
    isOpen: isTipModalOpen,
    close: closeTipModal,
  } = useDisclosure();

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  // Access global context
  const { tutorials, courses, session } = useContext(AppContext);
  const authMode = AuthModalState.SignIn;
  const isLoggedIn = !!session;

  // Fetch tutorial data
  const { data: tutorial, isFetched } = trpc.content.getTutorial.useQuery({
    id,
    language: i18n.language,
  });

  // Rewrite URL
  useEffect(() => {
    if (
      tutorial &&
      (params.name !== tutorial.name ||
        params.category !== tutorial.category ||
        params.subcategory !== tutorial.subcategory)
    ) {
      navigate({
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
  const { data: existingLike } =
    trpc.user.tutorials.getExistingLikeTutorial.useQuery(
      {
        id: tutorial?.id || '',
      },
      { enabled: !!tutorial?.id && isLoggedIn },
    );

  const { data: proofreading } = trpc.content.getProofreading.useQuery(
    {
      language: i18n.language,
      tutorialId: tutorial?.id,
    },
    { enabled: !!tutorial?.id },
  );

  // Mutation for liking/disliking a tutorial
  const likeTutorialMutation = trpc.user.tutorials.likeTutorial.useMutation({});

  // Update tutorial likes when fetched tutorial change
  useEffect(() => {
    if (tutorial) {
      setLikesCounts({
        likeCount: tutorial.likeCount,
        dislikeCount: tutorial.dislikeCount,
      });
    }
  }, [tutorial]);

  // Update existing like when fetched
  useEffect(() => {
    setIsLiked(existingLike || { liked: false, disliked: false });
  }, [existingLike]);

  // Like/dislike buttons component
  const LikeDislikeButtons = () => {
    // Handler functions for like and dislike buttons
    const handleLike = () => {
      if (!tutorial) return;

      likeTutorialMutation.mutate({ id: tutorial.id, liked: true });
      setIsLiked((prev) => ({
        liked: !prev.liked,
        disliked: false,
      }));
      setLikesCounts((prev) => {
        return {
          likeCount: isLiked.liked ? prev.likeCount - 1 : prev.likeCount + 1,
          dislikeCount: isLiked.disliked
            ? prev.dislikeCount - 1
            : prev.dislikeCount,
        };
      });
    };

    const handleDislike = () => {
      if (!tutorial) return;

      likeTutorialMutation.mutate({ id: tutorial.id, liked: false });
      setIsLiked((prev) => ({
        liked: false,
        disliked: !prev.disliked,
      }));
      setLikesCounts((prev) => {
        return {
          likeCount: isLiked.liked ? prev.likeCount - 1 : prev.likeCount,
          dislikeCount: isLiked.disliked
            ? prev.dislikeCount - 1
            : prev.dislikeCount + 1,
        };
      });
    };

    return (
      <div className="flex flex-col items-center gap-4 bg-newGray-6 w-fit rounded-[30px] px-7 pt-5 pb-4 border border-newGray-5 shadow-course-navigation-sm text-black mx-auto my-7">
        <span className="title-large-sb-24px">
          {t('tutorials.details.didHelp')}
        </span>
        <div className="flex items-center justify-between py-2.5 gap-10">
          {isFetched && tutorial && (
            <button
              onClick={() => {
                isLoggedIn ? handleLike() : openAuthModal();
              }}
              className={cn(
                'py-3 px-4 rounded-[20px] border shadow-course-navigation border-darkGreen-4',
                isLiked.liked ? 'bg-darkGreen-6' : 'hover:bg-darkGreen-6',
              )}
            >
              <img src={ThumbUp} alt="" className="size-12" />
            </button>
          )}
          {isFetched && tutorial && (
            <button
              onClick={() => {
                isLoggedIn ? handleDislike() : openAuthModal();
              }}
              className={cn(
                'py-3 px-4 rounded-[20px] border shadow-course-navigation border-red-2',
                isLiked.disliked ? 'bg-red-1' : 'hover:bg-red-1',
              )}
            >
              <img src={ThumbDown} alt="" className="size-12" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <MainLayout variant="light">
      <TutorialLayout
        currentCategory={tutorial?.category}
        currentSubcategory={tutorial?.subcategory}
        currentTutorialId={tutorial?.id}
      >
        <>
          {!isFetched && <Loader size={'s'} />}
          {isFetched && !tutorial && (
            <div className="flex flex-col text-black">
              {t('underConstruction.itemNotFoundOrTranslated', {
                item: t('words.tutorial'),
              })}
            </div>
          )}
          {proofreading ? (
            <ProofreadingProgress
              mode="light"
              proofreadingData={{
                contributors: proofreading.contributorsId,
                reward: proofreading.reward,
              }}
            />
          ) : (
            <></>
          )}
          {tutorial && (
            <>
              <PageMeta
                title={`${SITE_NAME} - ${tutorial?.title}`}
                description={capitalize(tutorial?.description || '')}
              />
              <div className="-mt-4 w-full max-w-5xl lg:hidden">
                <span className="mb-2 w-full text-left text-lg font-normal leading-6 text-darkOrange-5">
                  <Link to="/tutorials">{t('words.tutorials') + ` > `}</Link>
                  <Link
                    to={'/tutorials/$category'}
                    params={{ category: tutorial.category }}
                    className="capitalize"
                  >
                    {tutorial.category + ` > `}
                  </Link>
                  <span className="capitalize">{tutorial.title}</span>
                </span>
              </div>
              <div className="flex w-full flex-col items-center justify-center">
                <div className="w-full flex flex-col gap-6 text-blue-900 md:max-w-3xl">
                  <Header
                    tutorial={{
                      ...tutorial,
                      likeCount: likesCounts.likeCount,
                      dislikeCount: likesCounts.dislikeCount,
                    }}
                  />
                  <div className="break-words overflow-hidden w-full space-y-4 md:space-y-6">
                    <Suspense fallback={<Loader size={'s'} />}>
                      <TutorialsMarkdownBody
                        content={tutorial.rawContent}
                        assetPrefix={cdnUrl(tutorial.path)}
                        tutorials={tutorials || []}
                        courses={courses || []}
                      />
                    </Suspense>
                  </div>
                  <LikeDislikeButtons />
                  {tutorial.credits?.link && (
                    <span className="body-16px text-black mx-auto w-full">
                      {t('tutorials.details.source')}
                      <a
                        href={tutorial.credits.link}
                        target="_blank"
                        rel="noreferrer"
                        className="leading-snug tracking-015px underline text-newBlue-1 break-words"
                      >
                        {tutorial.credits.link}
                      </a>
                    </span>
                  )}
                </div>

                {tutorial.credits?.professor?.id && (
                  <AuthorDetails
                    tutorial={tutorial}
                    openTipModal={openTipModal}
                  />
                )}
              </div>

              {isTipModalOpen && (
                <TipModal
                  isOpen={isTipModalOpen}
                  onClose={closeTipModal}
                  lightningAddress={
                    tutorial.credits?.professor?.tips.lightningAddress as string
                  }
                  userName={tutorial.credits?.professor?.name as string}
                />
              )}

              {isAuthModalOpen && (
                <AuthModal
                  isOpen={isAuthModalOpen}
                  onClose={closeAuthModal}
                  initialState={authMode}
                />
              )}
            </>
          )}
        </>
      </TutorialLayout>
    </MainLayout>
  );
}
