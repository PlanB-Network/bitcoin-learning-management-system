import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import { capitalize } from 'lodash-es';
import React, { Suspense, useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { IoCheckmark } from 'react-icons/io5';
import { z } from 'zod';

import { DividerSimple, Loader, cn, customToast } from '@blms/ui';

import ThumbDown from '#src/assets/icons/thumb_down.svg';
import ThumbUp from '#src/assets/icons/thumb_up.svg';
// import ApprovedBadge from '#src/assets/tutorials/approved.svg?react';
import { AuthModal } from '#src/components/AuthModals/auth-modal.js';
import { AuthModalState } from '#src/components/AuthModals/props.js';
import PageMeta from '#src/components/Head/PageMeta/index.js';
import { MainLayout } from '#src/components/main-layout.tsx';
import {
  ProofreadingDesktop,
  ProofreadingProgress,
} from '#src/components/proofreading-progress.js';
import { useDisclosure } from '#src/hooks/use-disclosure.js';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.ts';
import { AppContext } from '#src/providers/context.js';
import { cdnUrl } from '#src/utils/index.js';
import { SITE_NAME } from '#src/utils/meta.js';
import { formatNameForURL } from '#src/utils/string.js';
import { type TRPCRouterOutput, trpc } from '#src/utils/trpc.js';

import type { JoinedProofreading } from '@blms/types';
import { AuthorCard } from '#src/components/author-card.tsx';
import { getNameAndIdFromUrl } from '#src/services/utils.tsx';
import { TutorialLayout } from '../-components/tutorial-layout.tsx';
import { TutorialLikes } from '../-components/tutorial-likes.tsx';

const TutorialsMarkdownBody = React.lazy(
  () => import('#src/components/Markdown/tutorials-markdown-body.js'),
);

export const Route = createFileRoute(
  '/$lang/_content/tutorials/$category/$subcategory/$name-$id',
)({
  params: {
    parse: (params) => {
      const nameId = params['name-$id'];
      const { id, name } = getNameAndIdFromUrl(nameId);

      return {
        lang: z.string().parse(params.lang),
        'name-$id': nameId,
        name: z.string().parse(name),
        id: z.string().parse(id),
        category: z.string().parse(params.category),
        subcategory: z.string().parse(params.subcategory),
      };
    },
    stringify: ({ lang, name, id, category, subcategory }) => ({
      lang: lang,
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
      <section className="flex justify-between items-end gap-4 w-full border-b md:border-b-2 border-newBlack-3 py-1 md:py-2.5">
        <h1 className="text-black md:text-5xl md:font-bold md:leading-[116%] display-small-bold-caps-22px md:stroke-gray-200 md:stroke-1">
          {tutorial.title}
        </h1>
        <TutorialLikes tutorial={tutorial} className="max-md:hidden shrink-0" />
      </section>

      <section className="flex justify-between items-center w-full mt-1 md:mt-5 gap-4">
        {tutorial.creditLink && (
          <span className="flex items-center gap-1.5 subtitle-small-14px text-newBlack-5 max-md:hidden w-full">
            <span className="shrink-0">
              {t('tutorials.details.source').toUpperCase()}
            </span>
            <a
              href={tutorial.creditLink}
              target="_blank"
              rel="noreferrer"
              className="max-w-[350px] leading-snug tracking-015px underline text-newBlue-1 truncate lowercase"
            >
              {tutorial.creditLink}
            </a>
          </span>
        )}
        {tutorial.professor?.name && (
          <span className="flex items-center gap-1.5 text-newBlack-5 shrink-0">
            <span className="max-md:hidden subtitle-small-caps-14px">
              {t('tutorials.details.author').toUpperCase()}
            </span>
            <a
              href={`/professor/${formatNameForURL(tutorial.professor?.name)}-${tutorial.professor?.id}`}
              className="text-newBlack-1 subtitle-medium-16px md:title-small-med-16px hover:underline"
            >
              {tutorial.professor?.name}
            </a>
          </span>
        )}
        <TutorialLikes
          tutorial={tutorial}
          className="md:hidden shrink-0 ml-auto"
        />
      </section>
    </div>
  );
};

const AuthorDetails = ({
  tutorial,
}: {
  tutorial: NonNullable<TRPCRouterOutput['content']['getTutorial']>;
}) => {
  const author = tutorial?.professor;

  return (
    <>
      <DividerSimple />
      <section className="w-full flex flex-col">
        <h4 className="subtitle-medium-caps-18px text-darkOrange-5">
          {t('words.author')}
        </h4>
        <p className="mt-[15px] md:mt-6 label-large-20px md:display-small-32px text-black">
          {t('tutorials.writtenBy')}{' '}
          <span className="text-darkOrange-5 label-large-20px md:display-small-32px">
            <Link
              to={`/professor/${formatNameForURL(author?.name || '')}-${author?.id}`}
              className="hover:text-darkOrange-5 hover:font-medium"
            >
              {author?.name}
            </Link>
          </span>
        </p>
        <p className="md:mt-6 text-newBlack-1 md:text-justify body-16px md:label-large-20px max-md:hidden">
          {t('courses.details.thanksTipping')}
        </p>
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
  tutorial: NonNullable<TRPCRouterOutput['content']['getTutorial']>;
  proofreading: JoinedProofreading | null | undefined;
}) => {
  const { i18n } = useTranslation();

  const isOriginalLanguage = i18n.language === tutorial.originalLanguage;
  if (!proofreading) {
    return null;
  }

  return (
    <>
      <DividerSimple />
      <section className="w-full flex flex-col">
        <h4 className="subtitle-medium-caps-18px text-darkOrange-5">
          {t('words.credits')}
        </h4>

        <p className="mt-[15px] md:mt-6 label-large-20px md:display-small-32px text-black">
          {proofreading?.contributorNames?.length > 0
            ? t('tutorials.hasBeenProofreadBy')
            : t('tutorials.hasNotBeenProofread')}
          <span className="text-darkOrange-5 label-large-20px md:display-small-32px">
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

        <div className="flex flex-col md:flex-row gap-6 lg:gap-[50px] mt-6 md:mt-[30px]">
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
          <p className="md:mb-8 text-newBlack-1 md:text-justify body-16px md:subtitle-medium-16px whitespace-pre-line">
            <Trans i18nKey={'courses.details.collaborativeEffort'}>
              <a
                className="hover:text-darkOrange-5 font-medium"
                href="https://t.me/PlanBNetwork_ContentBuilder"
                target="_blank"
                rel="noreferrer"
              >
                telegram
              </a>
              <Link
                to="/tutorials/others/contribution/content-review-tutorial-1ee068ca-ddaf-4bec-b44e-b41a9abfdef6"
                className="hover:text-darkOrange-5 font-medium"
                target="_blank"
                rel="noreferrer"
              >
                tutorial
              </Link>
              <a
                className="hover:text-darkOrange-5 font-medium"
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
  const [isLiked, setIsLiked] = useState({ liked: false, disliked: false });

  const [likesCounts, setLikesCounts] = useState({
    likeCount: 0,
    dislikeCount: 0,
  });

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
      (params.name !== formatNameForURL(tutorial.name) ||
        params.category !== formatNameForURL(tutorial.category) ||
        params.subcategory !== formatNameForURL(tutorial.subcategory ?? ''))
    ) {
      navigate({
        to: `/tutorials/${formatNameForURL(tutorial.category)}/${formatNameForURL(tutorial.subcategory || '')}/${formatNameForURL(tutorial.name)}-${tutorial.id}`,
        replace: true,
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
  const likeTutorialMutation = trpc.user.tutorials.likeTutorial.useMutation({
    onSuccess: (_, variables) => {
      const wasLiked = isLiked.liked;
      const wasDisliked = isLiked.disliked;

      if ((wasLiked && variables.liked) || (wasDisliked && !variables.liked)) {
        customToast(t('tutorials.details.ratingSuccess'), {
          mode: 'light',
          color: 'success',
          icon: IoCheckmark,
          closeButton: true,
          time: 5000,
        });
      }
    },
  });

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

      likeTutorialMutation.mutate({
        id: tutorial.id,
        liked: false,
      });
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
      <div className="flex flex-col items-center justify-center gap-2 md:gap-4 bg-newGray-6 w-[290px] md:w-fit rounded-[15px] md:rounded-[30px] px-[30px] py-5 md:pb-4 border border-newGray-5 shadow-course-navigation-sm-accent text-black mx-auto md:my-[30px]">
        <span className="title-medium-sb-18px md:title-large-sb-24px text-center text-newBlack-1">
          {t('tutorials.details.didHelp')}
        </span>
        <div className="flex items-center justify-between py-2.5 gap-6 md:gap-10">
          {isFetched && tutorial && (
            <button
              type="button"
              onClick={() => {
                isLoggedIn ? handleLike() : openAuthModal();
              }}
              className={cn(
                'py-3.5 px-[18px] rounded-lg md:rounded-[12px] border shadow-course-navigation border-brightGreen-6 focus:border-brightGreen-8',
                isLiked.liked
                  ? 'bg-brightGreen-1'
                  : 'hover:bg-brightGreen-1 bg-white',
              )}
            >
              <img src={ThumbUp} alt="" className="size-9 md:size-12" />
            </button>
          )}
          {isFetched && tutorial && (
            <button
              type="button"
              onClick={() => {
                isLoggedIn ? handleDislike() : openAuthModal();
              }}
              className={cn(
                'py-3 md:py-3.5 px-3.5 md:px-[18px] rounded-lg md:rounded-[12px] border shadow-course-navigation border-red-5 focus:border-red-7',
                isLiked.disliked ? 'bg-red-1' : 'hover:bg-red-1 bg-white',
              )}
            >
              <img src={ThumbDown} alt="" className="size-9 md:size-12" />
            </button>
          )}
        </div>
      </div>
    );
  };
  const isOriginalLanguage = tutorial?.language === tutorial?.originalLanguage;
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
              isOriginalLanguage={isOriginalLanguage}
              mode="light"
              proofreadingData={{
                contributors: proofreading.contributorNames,
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
              <div className="-mt-4 mb-4 w-full max-w-5xl md:hidden">
                <span className="w-full desktop-typo1 text-darkOrange-5">
                  <Link to="/tutorials">{`${t('words.tutorials')} > `}</Link>
                  <Link
                    to={'/tutorials/$category'}
                    params={{ category: tutorial.category }}
                    className="capitalize"
                  >
                    {`${tutorial.category} > `}
                  </Link>
                  <span className="capitalize">{tutorial.title}</span>
                </span>
              </div>
              <div className="flex w-full flex-col items-center justify-center">
                <div className="w-full flex flex-col gap-5 md:gap-[30px] text-newBlack-1 md:max-w-[800px]">
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
                  {tutorial.creditLink && (
                    <span className="w-full flex flex-col gap-4 subtitle-medium-caps-18px subtitle-small-caps-14px text-darkOrange-5 mx-auto">
                      {t('tutorials.details.source')}
                      <a
                        href={tutorial.creditLink}
                        target="_blank"
                        rel="noreferrer"
                        className="leading-snug tracking-015px underline text-newBlue-1 break-words lowercase max-w-full truncate"
                      >
                        {tutorial.creditLink}
                      </a>
                    </span>
                  )}
                  {tutorial.professor?.id && (
                    <AuthorDetails tutorial={tutorial} />
                  )}
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
        </>
      </TutorialLayout>
    </MainLayout>
  );
}
