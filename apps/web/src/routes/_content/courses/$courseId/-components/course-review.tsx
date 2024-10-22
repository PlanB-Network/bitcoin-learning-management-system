/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FaArrowRightLong } from 'react-icons/fa6';
import { z } from 'zod';

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Loader,
  Ratings,
  Slider,
  Textarea,
  cn,
} from '@blms/ui';

import { AuthModal } from '#src/components/AuthModals/auth-modal.tsx';
import { AuthModalState } from '#src/components/AuthModals/props.ts';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { goToChapterParameters } from '#src/utils/courses.js';
import type { TRPCRouterOutput } from '#src/utils/trpc.js';
import { trpc } from '#src/utils/trpc.js';

type Chapter = NonNullable<TRPCRouterOutput['content']['getCourseChapter']>;

const formDivClass = 'mb-6';

function FormSlider({
  id,
  form,
  label,
  stepNames,
  disabled,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  label: string;
  stepNames: string[];
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
      <div className="mb-5 w-full h-px my-2.5 bg-newGray-4" />
      <div className={formDivClass}>
        <FormField
          control={form.control}
          name={id}
          render={({ field: { value, onChange } }) => (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <Slider
                  {...sliderProps}
                  id={id}
                  disabled={disabled}
                  defaultValue={[value]}
                  onValueChange={(vals) => {
                    onChange(vals[0]);
                  }}
                  value={[form.getValues(id)]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="relative mt-4">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 max-w-[95%] mx-auto">
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
          <div className="flex lg:flex-col max-lg:justify-between text-[10px] md:text-sm font-medium text-newGray-1 text-center">
            {stepNames[0] && (
              <span className="lg:absolute lg:self-start lg:-translate-x-1/2 max-lg:w-1/3 text-left">
                {stepNames[0]}
              </span>
            )}
            {stepNames[1] && (
              <span className="lg:absolute lg:self-center max-lg:w-1/3 text-center">
                {stepNames[1]}
              </span>
            )}
            {stepNames[2] && (
              <span className="lg:absolute lg:self-end lg:translate-x-1/2 max-lg:w-1/3 text-right">
                {stepNames[2]}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormTextArea({
  id,
  control,
  label,
  disabled,
}: {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  label: string;
  disabled?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <FormField
      control={control}
      name={id}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render={({ field }: { field: any }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={t('courses.review.writeThoughts')}
              rows={3}
              disabled={disabled}
              className="w-full rounded-md px-4 py-2.5 text-newGray-1 border border-newGray-4 bg-white disabled:bg-newGray-4 subtitle-med-16px"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function CourseReview({
  chapter,
  courseId,
  formDisabled = false,
  showExplanation,
  addMarginToForm,
}: {
  chapter?: Chapter;
  courseId?: string;
  formDisabled?: boolean;
  showExplanation?: boolean;
  addMarginToForm?: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: previousCourseReview, isFetched: isReviewFetched } =
    trpc.user.courses.getCourseReview.useQuery(
      {
        courseId: chapter?.courseId || courseId || '',
      },
      {
        enabled: !formDisabled && !!(chapter || courseId),
      },
    );

  const saveCourseReview = trpc.user.courses.saveCourseReview.useMutation();
  const completeChapterMutation =
    trpc.user.courses.completeChapter.useMutation();

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  const authMode = AuthModalState.SignIn;

  const FormSchema = z.object({
    general: z.number().min(0).max(5),
    length: z.number().min(-5).max(5),
    difficulty: z.number().min(-5).max(5),
    quality: z.number().min(-5).max(5),
    faithful: z.number().min(-5).max(5),
    recommand: z.number().min(-5).max(5),
    publicComment: z.string(),
    teacherComment: z.string(),
    adminComment: z.string(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      general: 0,
      length: 0,
      difficulty: 0,
      quality: 0,
      faithful: 0,
      recommand: 0,
      publicComment: '',
      teacherComment: '',
      adminComment: '',
    },
  });

  useEffect(() => {
    if (previousCourseReview) {
      form.setValue('general', previousCourseReview.general);
      form.setValue('length', previousCourseReview.length);
      form.setValue('difficulty', previousCourseReview.difficulty);
      form.setValue('quality', previousCourseReview.quality);
      form.setValue('faithful', previousCourseReview.faithful);
      form.setValue('recommand', previousCourseReview.recommand);
      form.setValue('publicComment', previousCourseReview.publicComment ?? '');
      form.setValue(
        'teacherComment',
        previousCourseReview.teacherComment ?? '',
      );
      form.setValue('adminComment', previousCourseReview.adminComment ?? '');
    }
  }, [form, previousCourseReview]);

  const isLastChapter =
    chapter &&
    chapter.chapterIndex === chapter.part.chapters.length &&
    chapter.part.partIndex === chapter.course.parts.length;

  async function onSubmit() {
    if (!chapter && !courseId) {
      return;
    }

    await saveCourseReview.mutateAsync({
      ...form.getValues(),
      courseId: chapter?.courseId || courseId || '',
    });

    navigateToNextChapter();
  }

  async function navigateToNextChapter() {
    if (!chapter) {
      return;
    }

    if (!formDisabled) {
      await completeChapterMutation.mutateAsync({
        courseId: chapter.courseId,
        chapterId: chapter.chapterId,
      });
    }

    if (isLastChapter) {
      navigate({
        to: '/courses/$courseId',
        params: goToChapterParameters(chapter, 'next'),
      });
    } else {
      navigate({
        to: '/courses/$courseId/$chapterId',
        params: goToChapterParameters(chapter, 'next'),
      });
    }
  }

  return (
    <div className={cn('flex flex-col', addMarginToForm && 'mt-16')}>
      {isReviewFetched || formDisabled ? (
        <>
          {showExplanation && (
            <>
              <h1
                className={cn(
                  'text-center text-sm md:text-2xl mb-4',
                  !formDisabled && 'text-newOrange-1',
                )}
              >
                {t('courses.review.feedbackSessionTitle')}
              </h1>
              <div className="text-center gap-1 leading-7 whitespace-pre-line">
                <p>{t('courses.review.feedbackDescription')}</p>
              </div>
            </>
          )}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className={cn(
                'flex flex-col gap-5',
                addMarginToForm && 'mt-12 mx-4 md:mx-32',
              )}
              onClick={() => {
                formDisabled && openAuthModal();
              }}
              onKeyDown={() => {
                formDisabled && openAuthModal();
              }}
            >
              <FormField
                control={form.control}
                name={'general'}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="!mb-4">
                      {t('courses.review.generalGrade')}
                    </FormLabel>
                    <FormControl>
                      <div
                        className={cn(
                          'bg-newGray-6 py-7 rounded-full w-fit mx-auto px-11 shadow-course-navigation',
                          formDisabled && 'pointer-events-none',
                        )}
                      >
                        <Ratings
                          id="general"
                          variant="yellow"
                          disabled={formDisabled}
                          totalStars={5}
                          onValueChange={(v) => {
                            form.setValue('general', v);
                          }}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormSlider
                id="length"
                form={form}
                label={t('courses.review.length')}
                stepNames={[
                  t('courses.review.tooShort'),
                  t('courses.review.asExpected'),
                  t('courses.review.tooLong'),
                ]}
                disabled={formDisabled}
              />

              <FormSlider
                id="difficulty"
                form={form}
                label={t('courses.review.difficulty')}
                stepNames={[
                  t('courses.review.tooEasy'),
                  t('courses.review.asExpected'),
                  t('courses.review.tooHard'),
                ]}
                disabled={formDisabled}
              />

              <FormSlider
                id="quality"
                form={form}
                label={t('courses.review.quality')}
                stepNames={[
                  t('courses.review.veryBad'),
                  t('courses.review.soAndSo'),
                  t('courses.review.veryGood'),
                ]}
                disabled={formDisabled}
              />

              <FormSlider
                id="faithful"
                form={form}
                label={t('courses.review.faithful')}
                stepNames={[
                  t('courses.review.notReally'),
                  t('courses.review.neutral'),
                  t('courses.review.yesVeryMuch'),
                ]}
                disabled={formDisabled}
              />

              <FormSlider
                id="recommand"
                form={form}
                label={t('courses.review.recommend')}
                stepNames={[
                  t('courses.review.no'),
                  t('courses.review.soAndSo'),
                  t('courses.review.yesOfCourse'),
                ]}
                disabled={formDisabled}
              />

              <div className="mb-5 w-10/12 mx-auto h-px my-2.5 bg-newGray-1" />

              <div className="flex flex-col gap-6">
                <FormTextArea
                  id="publicComment"
                  control={form.control}
                  label={t('courses.review.commentPublic')}
                  disabled={formDisabled}
                />

                <FormTextArea
                  id="teacherComment"
                  control={form.control}
                  label={t('courses.review.commentTeacher')}
                  disabled={formDisabled}
                />

                <FormTextArea
                  id="adminComment"
                  control={form.control}
                  label={t('courses.review.commentAdmin')}
                  disabled={formDisabled}
                />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mx-auto mt-6 lg:mt-4">
                <Button
                  type="submit"
                  className="w-fit"
                  variant="primary"
                  size={window.innerWidth >= 768 ? 'l' : 'm'}
                  disabled={formDisabled}
                >
                  {previousCourseReview
                    ? t('courses.review.edit')
                    : t('courses.review.submitReview')}
                </Button>

                <Button
                  variant="outline"
                  className="w-fit"
                  size={window.innerWidth >= 768 ? 'l' : 'm'}
                  onClick={() => {
                    navigateToNextChapter();
                  }}
                >
                  <span>{t('courses.chapter.next')}</span>
                  <FaArrowRightLong
                    className={cn(
                      'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                      'group-hover:ml-3',
                    )}
                  />
                </Button>
              </div>
            </form>
          </Form>
          {isAuthModalOpen && (
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={closeAuthModal}
              initialState={authMode}
            />
          )}
        </>
      ) : (
        <Loader size={'m'} />
      )}
    </div>
  );
}
