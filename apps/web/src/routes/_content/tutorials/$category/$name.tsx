import { Link, createFileRoute, useParams } from '@tanstack/react-router';
import { t } from 'i18next';
import { capitalize } from 'lodash-es';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@blms/ui';

import DonateLightning from '#src/assets/icons/donate_lightning.svg?react';
import ThumbDown from '#src/assets/icons/thumb_down.svg?react';
import ThumbUp from '#src/assets/icons/thumb_up.svg?react';
import Spinner from '#src/assets/spinner_orange.svg?react';
// import ApprovedBadge from '#src/assets/tutorials/approved.svg?react';
import { AuthModal } from '#src/components/AuthModal/index.js';
import { AuthModalState } from '#src/components/AuthModal/props.js';
import PageMeta from '#src/components/Head/PageMeta/index.js';
import { TipModal } from '#src/components/tip-modal.js';
import { TooltipWithContent } from '#src/components/tooptip-with-content.js';
import { TutorialsMarkdownBody } from '#src/components/TutorialsMarkdownBody/index.js';
import { useDisclosure } from '#src/hooks/use-disclosure.js';
import { AppContext } from '#src/providers/context.js';
import { computeAssetCdnUrl } from '#src/utils/index.js';
import { SITE_NAME } from '#src/utils/meta.js';
import { formatNameForURL } from '#src/utils/string.js';
import { type TRPCRouterOutput, trpc } from '#src/utils/trpc.js';

import { TutorialLikes } from '../-components/tutorial-likes.tsx';
import { TutorialLayout } from '../-other/layout.tsx';

export const Route = createFileRoute('/_content/tutorials/$category/$name')({
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

const AuthorDetails = ({
  tutorial,
  openTipModal,
}: {
  tutorial: NonNullable<TRPCRouterOutput['content']['getTutorial']>;
  openTipModal: () => void;
}) => {
  return (
    <article className="flex flex-col p-2 md:p-7 gap-5 rounded-2xl border-t border-t-newGray-4 bg-newGray-6 shadow-course-navigation mt-8">
      <span className="label-normal-16px md:label-large-20px font-medium text-newBlack-1 w-full max-md:text-center">
        {t('tutorials.details.writtenBy')}
      </span>
      <div className="flex max-md:flex-col max-md:gap-4 md:items-end gap-7">
        <div className="rounded-[20px] md:p-4 border-1 md:border-2 border-newBlack-1">
          <Link
            to={`/professor/${formatNameForURL(tutorial?.credits?.professor?.name || '')}-${tutorial?.credits?.professor?.id}`}
            className="rounded-[20px] flex flex-col items-center bg-gradient-to-b from-[#411800] to-[#FF5C00] p-2.5 md:w-[280px] relative overflow-hidden"
          >
            <span className="mb-2.5 w-full text-center title-large-sb-24px text-white z-10">
              {tutorial?.credits?.professor?.name}
            </span>
            <img
              src={tutorial?.credits?.professor?.picture}
              alt={tutorial?.credits?.professor?.name}
              className="size-32 rounded-full z-10"
            />
            <div className="flex gap-4 items-end mt-2.5 z-10">
              {/* Courses */}
              <div className="flex flex-col gap">
                <span className="text-5xl leading-[116%] text-center text-white">
                  {tutorial?.credits?.professor?.coursesCount}
                </span>
                <span className="font-semibold leading-[133%] text-center text-white">
                  {t('words.courses')}
                </span>
              </div>
              {/* Tutorials */}
              <div className="flex flex-col gap">
                <span className="text-5xl leading-[116%] text-center text-white">
                  {tutorial?.credits?.professor?.tutorialsCount}
                </span>
                <span className="font-semibold leading-[133%] text-center text-white">
                  {t('words.tutorials')}
                </span>
              </div>
            </div>

            {/* Background element */}
            <BackgroundAuthorCardElement />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="flex items-center justify-center p-3 rounded-2xl bg-white shadow-course-navigation border border-darkOrange-2 overflow-hidden size-16 hover:bg-darkOrange-0 shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openTipModal();
            }}
          >
            <TooltipWithContent
              text={t('tutorials.details.tipTooltip')}
              position="bottom"
            >
              <DonateLightning className="size-16" />
            </TooltipWithContent>
          </button>
          <div className="title-small-med-16px text-black whitespace-pre-line">
            {t('courses.chapter.thanksTip')}
          </div>
        </div>
      </div>
    </article>
  );
};

const BackgroundAuthorCardElement = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="280"
      height="143"
      viewBox="0 0 280 143"
      fill="none"
      className="absolute bottom-0 w-full"
    >
      <path
        d="M147.147 1.98324C142.545 0.222654 137.455 0.222651 132.853 1.98323L12.8534 47.8939C5.11227 50.8556 0 58.2852 0 66.5735V259.249C0 270.295 8.95431 279.249 20 279.249H260C271.046 279.249 280 270.295 280 259.249V66.5735C280 58.2852 274.888 50.8556 267.147 47.8939L147.147 1.98324Z"
        fill="url(#paint0_linear_5830_16430)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_5830_16430"
          x1="140"
          y1="-0.750977"
          x2="140"
          y2="279.249"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#853000" />
          <stop offset="1" />
        </linearGradient>
      </defs>
    </svg>
  );
};

function TutorialDetails() {
  const { i18n } = useTranslation();
  const { category, name } = useParams({
    from: '/tutorials/$category/$name',
  });

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

  // Fetch tutorial data
  const { data: tutorial, isFetched } = trpc.content.getTutorial.useQuery({
    category,
    name,
    language: i18n.language,
  });

  // Fetch existing like/dislike status
  const { data: existingLike } =
    trpc.user.tutorials.getExistingLikeTutorial.useQuery(
      {
        id: tutorial?.id || 0,
      },
      { enabled: !!tutorial?.id },
    );

  // Access global context
  const { tutorials, session } = useContext(AppContext);
  const isFetchedTutorials = tutorials && tutorials.length > 0;
  const authMode = AuthModalState.SignIn;
  const isLoggedIn = !!session;

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

  // Memoized markdown content
  const memoizedMarkdown = useMemo(() => {
    if (isFetchedTutorials && tutorial) {
      return (
        <TutorialsMarkdownBody
          content={tutorial.rawContent}
          assetPrefix={computeAssetCdnUrl(tutorial.lastCommit, tutorial.path)}
          tutorials={tutorials || []}
        />
      );
    }
    return null;
  }, [isFetchedTutorials, tutorial, tutorials]);

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
              <ThumbUp className="size-12" />
            </button>
          )}
          {isFetched && tutorial && (
            <button
              onClick={() => {
                isLoggedIn ? handleDislike() : openAuthModal();
              }}
              className={cn(
                'py-3 px-4 rounded-[20px] border shadow-course-navigation border-red-5',
                isLiked.disliked ? 'bg-red-6' : 'hover:bg-red-6',
              )}
            >
              <ThumbDown className="size-12" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <TutorialLayout
      currentCategory={tutorial?.category}
      currentSubcategory={tutorial?.subcategory}
      currentTutorialId={tutorial?.id}
    >
      <>
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
            <div className="flex w-full flex-col items-center justify-center px-2">
              <div className="w-full flex flex-col gap-6 text-blue-900 md:max-w-3xl">
                <Header
                  tutorial={{
                    ...tutorial,
                    likeCount: likesCounts.likeCount,
                    dislikeCount: likesCounts.dislikeCount,
                  }}
                />
                <div className="break-words overflow-hidden w-full space-y-4 md:space-y-6">
                  {memoizedMarkdown}
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

        {!isFetched && <Spinner className="size-24 md:size-32 mx-auto" />}
      </>
    </TutorialLayout>
  );
}
