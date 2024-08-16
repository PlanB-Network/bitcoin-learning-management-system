import { Link } from '@tanstack/react-router';
import type { ChangeEventHandler } from 'react';
import { useEffect, useState } from 'react';

import { Button, Divider, Ratings, Slider, cn } from '@blms/ui';

import Spinner from '#src/assets/spinner_orange.svg?react';
import { goToChapterParameters } from '#src/utils/courses.js';
import type { TRPCRouterOutput } from '#src/utils/trpc.js';
import { trpc } from '#src/utils/trpc.js';

type Chapter = NonNullable<TRPCRouterOutput['content']['getCourseChapter']>;

const formDivClass = 'mb-6';
const formLabelClass =
  'text-center mb-2 block max-md:text-sm max-md:leading-[120%] md:desktop-h7 text-[#050A14]';
const formSliderClass = '';

function FormSlider({
  id,
  text,
  value,
  stepNames = [],
  onChange,
  disabled,
  ...props
}: {
  id: string;
  text: string;
  value: number;
  stepNames?: string[];
  onChange: (value: number[]) => void;
  disabled?: boolean;
}) {
  const sliderProps = {
    min: -5,
    default: [0],
    max: 5,
    step: 1,
  };

  return (
    <div className="flex flex-col">
      <div className={formDivClass} {...props}>
        <label className={formLabelClass} htmlFor={id}>
          {text}
        </label>
        <Slider
          {...sliderProps}
          className={formSliderClass}
          id={id}
          disabled={disabled}
          value={[value]}
          onValueChange={onChange}
        />
        <div className="relative mt-4">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
            <div className="relative flex justify-between">
              {Array.from({ length: 11 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[2px] h-1 bg-newGray-3"
                  style={{ left: `${(i / 10) * 100}%` }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="relative mt-8">
          <div className="flex flex-col text-sm font-medium text-newGray-1">
            {stepNames[0] && (
              <span className="absolute self-start -translate-x-1/2">
                {stepNames[0]}
              </span>
            )}
            {stepNames[1] && (
              <span className="absolute self-center">{stepNames[1]}</span>
            )}
            {stepNames[2] && (
              <span className="absolute self-end translate-x-1/2">
                {stepNames[2]}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="my-12 w-full self-center justify-center ml-auto">
        <Divider></Divider>
      </div>
    </div>
  );
}

function FormTextArea({
  id,
  text,
  value,
  onChange,
  disabled,
  ...props
}: {
  id: string;
  text: string;
  value: string;
  disabled?: boolean;
  onChange: ChangeEventHandler<HTMLTextAreaElement> | undefined;
}) {
  return (
    <div className={formDivClass} {...props}>
      <label className={formLabelClass} htmlFor={id}>
        {text}
      </label>
      <textarea
        id={id}
        rows={3}
        value={value}
        placeholder="Here you can write your thoughts"
        disabled={disabled}
        onChange={onChange}
        className="w-full rounded-md px-4 py-1 text-gray-400 border border-gray-400/6"
      />
    </div>
  );
}

export function CourseReview({
  chapter,
  formDisabled = false,
}: {
  chapter: Chapter;
  formDisabled?: boolean;
}) {
  const { data: previousCourseReview, isFetched: isReviewFetched } =
    trpc.user.courses.getCourseReview.useQuery(
      {
        courseId: chapter.courseId,
      },
      {
        enabled: !formDisabled,
      },
    );

  const saveCourseReview = trpc.user.courses.saveCourseReview.useMutation();
  const completeChapterMutation =
    trpc.user.courses.completeChapter.useMutation();

  const [review, setReview] = useState({
    general: 0,
    length: 0,
    difficulty: 0,
    quality: 0,
    faithful: 0,
    recommand: 0,
    publicComment: '',
    teacherComment: '',
    adminComment: '',
    courseId: chapter.courseId,
  });

  useEffect(() => {
    if (previousCourseReview) {
      setReview({
        ...review,
        general: previousCourseReview.general,
        length: previousCourseReview.length,
        difficulty: previousCourseReview.difficulty,
        quality: previousCourseReview.quality,
        faithful: previousCourseReview.faithful,
        recommand: previousCourseReview.recommand,
        publicComment: previousCourseReview.publicComment
          ? previousCourseReview.publicComment
          : '',
        teacherComment: previousCourseReview.teacherComment
          ? previousCourseReview.teacherComment
          : '',
        adminComment: previousCourseReview.adminComment
          ? previousCourseReview.adminComment
          : '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousCourseReview]);

  const isLastChapter =
    chapter.chapterIndex === chapter.part.chapters.length &&
    chapter.part.partIndex === chapter.course.parts.length;

  return (
    <div className="flex flex-col">
      {isReviewFetched || formDisabled ? (
        <>
          <h1
            className={cn(
              'text-center text-sm md:text-2xl mb-4',
              !formDisabled && 'text-newOrange-1',
            )}
          >
            Feedback session
          </h1>
          <div className="text-center gap-1 leading-7">
            <p>
              Please rate your experience of the course below. <br />
              This feedback session is mandatory to have access to the final
              exam, and to validate the course. <br />
              Note that teachers will not have access to individual evaluations.
            </p>
          </div>
          <form>
            <div className="mx-32">
              <div className="my-12 mx-auto w-full">
                <label className={formLabelClass} htmlFor={'general'}>
                  General grade
                </label>
                <div className="bg-newGray-2 py-4 rounded-full w-fit mx-auto px-12">
                  <Ratings
                    id="general"
                    value={review.general}
                    variant="yellow"
                    aria-disabled={formDisabled}
                    totalStars={5}
                    onValueChange={(v) => {
                      setReview({
                        ...review,
                        general: v,
                      });
                    }}
                  />
                </div>
              </div>
              <FormSlider
                id="length"
                text="Length"
                stepNames={['too short', 'as expected', 'too long']}
                value={review.length}
                disabled={formDisabled}
                onChange={(v) => {
                  setReview({
                    ...review,
                    length: v[0],
                  });
                }}
              />

              <FormSlider
                id="difficulty"
                text="Difficulty"
                stepNames={['too easy', 'as expected', 'too hard']}
                value={review.difficulty}
                disabled={formDisabled}
                onChange={(v) => {
                  setReview({
                    ...review,
                    difficulty: v[0],
                  });
                }}
              />

              <FormSlider
                id="quality"
                text="Quality"
                stepNames={['very bad', 'so and so', 'very good']}
                value={review.quality}
                disabled={formDisabled}
                onChange={(v) => {
                  setReview({
                    ...review,
                    quality: v[0],
                  });
                }}
              />

              <FormSlider
                id="faithful"
                text="True to objective ?"
                stepNames={['no, not really', 'neutral', 'yes, very much']}
                value={review.faithful}
                disabled={formDisabled}
                onChange={(v) => {
                  setReview({
                    ...review,
                    faithful: v[0],
                  });
                }}
              />

              <FormSlider
                id="recommand"
                text="Would recommand ?"
                stepNames={['no', 'so and so', 'yes of course']}
                value={review.recommand}
                disabled={formDisabled}
                onChange={(v) => {
                  setReview({
                    ...review,
                    recommand: v[0],
                  });
                }}
              />
            </div>

            <div className="mb-12">
              <Divider></Divider>
            </div>

            <FormTextArea
              id="publicComment"
              text="Comment (public)"
              value={review.publicComment}
              disabled={formDisabled}
              onChange={(e) => {
                setReview({
                  ...review,
                  publicComment: e.target.value,
                });
              }}
            />

            <FormTextArea
              id="teacherComment"
              text="Comment to the teacher (private)"
              value={review.teacherComment}
              disabled={formDisabled}
              onChange={(e) => {
                setReview({
                  ...review,
                  teacherComment: e.target.value,
                });
              }}
            />

            <FormTextArea
              id="adminComment"
              text="Comment to the admin team (private)"
              value={review.adminComment}
              disabled={formDisabled}
              onChange={(e) => {
                setReview({
                  ...review,
                  adminComment: e.target.value,
                });
              }}
            />
          </form>

          <Link
            className="self-center w-fit"
            to={
              isLastChapter
                ? '/courses/$courseId'
                : '/courses/$courseId/$chapterId'
            }
            params={goToChapterParameters(chapter, 'next')}
          >
            <Button
              className=""
              variant="newPrimary"
              size="l"
              onHoverArrow
              disabled={formDisabled}
              onClick={async () => {
                await saveCourseReview.mutateAsync(review);
                await completeChapterMutation.mutateAsync({
                  courseId: chapter.courseId,
                  chapterId: chapter.chapterId,
                });
              }}
            >
              <span>Submit review</span>
            </Button>
          </Link>
        </>
      ) : (
        <Spinner className="size-32 md:size-64 mx-auto" />
      )}
    </div>
  );
}
