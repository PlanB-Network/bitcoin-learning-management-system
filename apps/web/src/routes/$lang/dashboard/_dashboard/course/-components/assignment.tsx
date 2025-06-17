import type { CourseAssignment } from '@blms/types';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  BasicModal,
  Button,
  ButtonWithArrow,
  CollapsibleDropdown,
  DialogClose,
  Divider,
  Loader,
  cn,
  customToast,
} from '@blms/ui';
import { t } from 'i18next';
import type React from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { LuGripVertical } from 'react-icons/lu';
import Certificate from '#src/assets/icons/certificate.svg';
import SadFace from '#src/assets/icons/face_sad.svg';
import ThumbUp from '#src/assets/icons/thumb_up.svg';
import InformationIcon from '#src/assets/icons/warning_orange.svg';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { trpc } from '#src/utils/trpc.ts';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Trans } from 'react-i18next';
import { BiPencil } from 'react-icons/bi';
import { FaTelegram } from 'react-icons/fa6';
import {
  IoCheckmark,
  IoCheckmarkOutline,
  IoWarningOutline,
} from 'react-icons/io5';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiArrowGoBackFill } from 'react-icons/ri';
import { TbAlertOctagon } from 'react-icons/tb';
import { AppContext } from '#src/providers/context.tsx';
import { formatNameForURL } from '#src/utils/string.ts';

interface RankingItemProps {
  name: string;
  description: string;
  fileUrl: string;
  rank?: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, dropIndex: number) => void;
  isDraggedOver?: boolean;
  isDragging?: boolean;
  index?: number;
}

export const Assignment = ({
  courseId,
}: {
  courseId: string;
}) => {
  const { user } = useContext(AppContext);
  const { courses } = useContext(AppContext);

  const courseInfo = courses?.find((course) => course.id === courseId);

  const [assignmentsOrdered, setAssignmentsOrdered] = useState<
    CourseAssignment[]
  >([]);

  const {
    data: userProgress,
    refetch: refetchUserProgress,
    isFetched: userProgressFetched,
  } = useQuery(
    trpc.user.courses.getProgress.queryOptions({
      courseId,
    }),
  );

  const { data: assignments } = useQuery(
    trpc.content.getCourseAssignments.queryOptions({
      courseId,
    }),
  );

  const saveAssignments = useMutation(
    trpc.user.courses.saveCourseAssignmentsOrder.mutationOptions({
      onSuccess: () => {
        refetchUserProgress();
        customToast(t('dashboard.course.listSaved'), {
          mode: 'light',
          color: 'success',
          icon: IoCheckmark,
          closeButton: true,
          time: 5000,
        });
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      },
    }),
  );

  const saveSubmissionDate = useMutation(
    trpc.user.courses.saveCourseAssignmentSubmissionTime.mutationOptions({
      onSuccess: () => {
        refetchUserProgress();
      },
    }),
  );

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [workErrorMessage, setWorkErrorMessage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const openAssignmentDate = new Date('2025-06-02T00:00:00Z').getTime();
  const currentTime = new Date().getTime();
  const isAssignmentOpen = currentTime >= openAssignmentDate;
  const isBeforeAssignmentOpen = currentTime < openAssignmentDate;

  const courseProgress = userProgress?.[0];
  const isSelectedForAssignment =
    courseProgress?.isSelectedForAssignment ?? false;
  const hasAppliedAssignments = courseProgress?.appliedAssignmentIds !== null;
  const hasAffectedAssignment = courseProgress?.affectedAssignmentId !== null;
  const hasSubmittedWork = courseProgress?.assignmentSubmissionTime !== null;

  const shouldShowRanking = isSelectedForAssignment || isBeforeAssignmentOpen;
  const canRankAssignments =
    isAssignmentOpen &&
    isSelectedForAssignment &&
    !hasAppliedAssignments &&
    !hasAffectedAssignment;
  const hasAlreadyRanked =
    isSelectedForAssignment && hasAppliedAssignments && isAssignmentOpen;

  const affectedAssignment = assignments?.find(
    (assignment) => assignment.id === courseProgress?.affectedAssignmentId,
  );

  const isNotSelected = !isSelectedForAssignment && isAssignmentOpen;

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newAssignments = [...assignmentsOrdered];
      [newAssignments[index], newAssignments[index - 1]] = [
        newAssignments[index - 1],
        newAssignments[index],
      ];
      setAssignmentsOrdered(newAssignments);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < assignmentsOrdered.length - 1) {
      const newAssignments = [...assignmentsOrdered];
      [newAssignments[index], newAssignments[index + 1]] = [
        newAssignments[index + 1],
        newAssignments[index],
      ];
      setAssignmentsOrdered(newAssignments);
    }
  };

  const handleSaveList = () => {
    saveAssignments.mutate({
      courseId,
      assignmentsIds: assignmentsOrdered.map((assignment) => assignment.id),
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDraggedOverIndex(null);
      return;
    }

    const newAssignments = [...assignmentsOrdered];
    const draggedItem = newAssignments[draggedIndex];

    newAssignments.splice(draggedIndex, 1);
    newAssignments.splice(dropIndex, 0, draggedItem);

    setAssignmentsOrdered(newAssignments);
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  const handleWorkUpload = async () => {
    const file = selectedFile;
    if (file) {
      if (file.type !== 'application/pdf') {
        setWorkErrorMessage(t('dashboard.careerPortal.invalidFile'));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setWorkErrorMessage(t('dashboard.careerPortal.fileTooLarge'));
        return;
      }

      const renamedFile = new File(
        [file],
        `${formatNameForURL(affectedAssignment?.name || '')}_${formatNameForURL(user?.username || '')}.pdf`,
        { type: file.type },
      );

      const formData = new FormData();
      formData.append('file', renamedFile);

      setIsUploading(true);

      try {
        const response = await fetch(
          `/api/course-assignments/submit/${courseId}/${renamedFile.name}`,
          {
            method: 'POST',
            body: formData,
          },
        );

        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`);
        }

        saveSubmissionDate.mutate({ courseId });
        setWorkErrorMessage('');
        customToast(t('dashboard.course.fileUploaded'), {
          mode: 'light',
          color: 'success',
          icon: IoCheckmarkOutline,
          closeButton: true,
        });
      } catch (error) {
        setWorkErrorMessage(t('dashboard.careerPortal.fileUploadError'));
        customToast(t('dashboard.careerPortal.fileUploadError'), {
          mode: 'light',
          color: 'warning',
          icon: IoWarningOutline,
          closeButton: true,
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  useEffect(() => {
    if (assignments) {
      setAssignmentsOrdered(assignments);
    }
  }, [assignments]);

  if (!courseInfo) {
    return <Loader />;
  }

  return (
    <section className="flex flex-col mt-4 md:mt-8 w-full max-w-[1000px] gap-4 md:gap-8">
      <div className="flex flex-col gap-5">
        <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
          {t('dashboard.course.assignment')}
        </h2>
        <CollapsibleDropdown
          title={t('dashboard.course.assignmentInformation')}
          className="border border-newGray-4"
          variant="dark"
          defaultOpen={!hasAffectedAssignment}
          type="info"
        >
          <p className="whitespace-pre-line text-newBlack-4 body-14px md:body-16px ">
            {t('dashboard.course.assignmentDescription')}
          </p>
        </CollapsibleDropdown>
      </div>

      {shouldShowRanking && !hasAffectedAssignment && (
        <>
          <div className="flex flex-col gap-4 md:gap-5">
            <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
              {t('dashboard.course.rankProjectPreferences')}
            </h2>

            {!hasAlreadyRanked && (
              <Alert hasCloseButton variant="warning">
                <AlertTitle icon={TbAlertOctagon}>
                  {t('dashboard.course.projectRankingInstructions')}
                </AlertTitle>
                <AlertDescription>
                  <div className="flex flex-col text-newBlack-2">
                    <p className="font-medium">
                      {t('dashboard.course.rankingOnly24Hours')}
                    </p>
                    <p>{t('dashboard.course.rankingInstructions')}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {canRankAssignments && (
            <>
              <div className="flex flex-col gap-4">
                <span className="subtitle-small-caps-14px text-newBlack-5">
                  {t('dashboard.course.mostPreferred')}
                </span>

                {assignmentsOrdered.map((assignment, index) => (
                  <RankingItem
                    key={assignment.id}
                    name={assignment.name}
                    description={assignment.description}
                    fileUrl={`/api/files/${assignment.fileUrl}`}
                    rank={index + 1}
                    index={index}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    isDragging={draggedIndex === index}
                    isDraggedOver={draggedOverIndex === index}
                  />
                ))}

                <span className="subtitle-small-caps-14px text-newBlack-5">
                  {t('dashboard.course.leastPreferred')}
                </span>
              </div>
              <ConfirmAssignmentsOrderDialog onConfirm={handleSaveList} />
            </>
          )}

          {hasAlreadyRanked && (
            <InformationalPanel
              icon={ThumbUp}
              iconClassName="filter-darkOrange"
              description={t('dashboard.course.listSavedComeTomorrow')}
            />
          )}
        </>
      )}

      {hasAffectedAssignment && affectedAssignment && (
        <div className="flex flex-col gap-5 md:gap-8">
          <div className="flex flex-col gap-5">
            <h3 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
              {t('dashboard.course.yourProject')}
            </h3>

            <article className="flex flex-col gap-4 p-4 rounded-xl border border-newGray-5 bg-newGray-6 subtitle-medium-16px">
              <h4>
                {t('words.company')}:{' '}
                <span className="font-medium">{affectedAssignment.name}</span>
              </h4>
              <h4>
                {t('words.title')}:{' '}
                <span className="font-medium">
                  {affectedAssignment.description}
                </span>
              </h4>
              <h4>
                {t('words.mentor')}:{' '}
                <span className="font-medium">{affectedAssignment.mentor}</span>
              </h4>
              <div className="flex max-md:flex-wrap gap-4 items-center">
                <Button variant="outline" mode="light" size="s" asChild>
                  <a
                    href={`/api/files/${affectedAssignment.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MdOutlineRemoveRedEye className="mr-2" />
                    {t('dashboard.course.readAssignment')}
                  </a>
                </Button>
                <Button variant="outline" mode="light" size="s" asChild>
                  <a
                    href={affectedAssignment.telegramUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FaTelegram className="mr-2" />
                    {t('dashboard.course.joinTelegramGroup')}
                  </a>
                </Button>
              </div>
            </article>
          </div>

          <Divider mode="light" className="!mx-0" width="w-full" />

          {!hasSubmittedWork && (
            <div className="flex flex-col gap-5">
              <h3 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
                {t('dashboard.course.submitYourWork')}
              </h3>

              <Alert hasCloseButton variant="warning">
                <AlertTitle icon={TbAlertOctagon}>
                  {t('dashboard.course.submissionInstructions')}
                </AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-6 text-newBlack-2">
                    <li>
                      <Trans i18nKey={'dashboard.course.submitBefore'}>
                        <span className="font-medium">
                          June 18th at 23:59 (UTC+2)
                        </span>
                      </Trans>
                    </li>
                    <li>{t('dashboard.course.mustBePdf')}</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-1 md:gap-2 mb-5 md:mb-10">
                {/* Hidden file input */}
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      setSelectedFileName(file.name);
                    }
                  }}
                />
                <div className="flex max-md:flex-wrap gap-4 w-full">
                  <div className="flex flex-col gap-2 max-w-[614px] w-full">
                    <div className="flex items-center rounded-[10px] overflow-hidden w-full hover:shadow-course-navigation-sm h-[46px]">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-full flex items-center px-3.5 rounded-l-[10px] border border-newBlack-4 md:text-lg leading-normal font-medium bg-darkOrange-5 text-white hover:cursor-pointer shrink-0 focus:border-newBlack-2 focus:bg-darkOrange-6"
                      >
                        {t('dashboard.careerPortal.chooseFile')}
                      </button>
                      <span className="h-full flex items-center px-3.5 body-16px md:label-medium-16px text-newBlack-5 truncate w-full border-r border-y border-newBlack-4 rounded-r-[10px]">
                        {selectedFileName ||
                          t('dashboard.careerPortal.noFileSelected')}
                      </span>
                    </div>

                    <p className="body-14px text-newGray-1">
                      {t('dashboard.careerPortal.acceptedFormat')}
                    </p>
                    {workErrorMessage && (
                      <p className="text-red-6 body-14px">{workErrorMessage}</p>
                    )}
                  </div>
                  <ConfirmSubmissionDialog
                    onConfirm={handleWorkUpload}
                    selectedFile={selectedFile}
                    isUploading={isUploading}
                  />
                </div>
              </div>
            </div>
          )}

          {hasSubmittedWork &&
            (courseInfo.isAssignmentGradingPublished ? (
              <InformationalPanel
                icon={Certificate}
                title={t('dashboard.course.assignmentCompletedTitle')}
                description={
                  <ButtonWithArrow
                    variant="outline"
                    mode="light"
                    size="s"
                    asChild
                  >
                    <Link to={'#singleTrialExam'}>
                      {t('dashboard.course.viewFinalGrade')}
                    </Link>
                  </ButtonWithArrow>
                }
                subtitle={
                  courseProgress?.assignmentGrade != null &&
                  courseProgress.assignmentGrade >= 0
                    ? `${courseProgress.assignmentGrade}%`
                    : 'N/A'
                }
              />
            ) : (
              <InformationalPanel
                icon={Certificate}
                title={t('dashboard.course.assignmentCompletedTitle')}
                description={t(
                  'dashboard.course.assignmentCompletedDescription',
                )}
              />
            ))}
        </div>
      )}

      {isNotSelected && userProgressFetched && (
        <InformationalPanel
          icon={SadFace}
          iconClassName="filter-darkOrange"
          description={t('dashboard.course.notSelectedAssignment')}
        />
      )}
    </section>
  );
};

const RankingItem = ({
  name,
  description,
  fileUrl,
  rank = 1,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging = false,
  isDraggedOver = false,
  index = 0,
}: RankingItemProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    onDragStart?.(e, index);
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  const handleDragOver = (e: React.DragEvent) => {
    onDragOver?.(e);
  };

  const handleDrop = (e: React.DragEvent) => {
    onDrop?.(e, index);
  };

  return (
    <div
      className={cn(
        'w-full flex items-center gap-4 transition-all bg-transparent',
        isDraggedOver && !isDragging && 'transform scale-101',
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Mobile */}
      <div className="md:hidden w-full flex">
        <div className="w-10 py-2 bg-darkOrange-0 border border-darkOrange-1 rounded-l-lg flex flex-col justify-between items-center">
          <button
            className={cn(
              'w-8.5 h-6.5 px-2 py-2.5 rounded-lg flex items-center justify-center transition-colors',
              rank === 1 ? 'opacity-30 cursor-not-allowed' : '',
            )}
            onClick={rank === 1 ? undefined : onMoveUp}
            type="button"
            disabled={rank === 1}
          >
            <BsChevronUp className="size-4.5 text-black" />
          </button>

          <div className="flex-1 flex items-center justify-center">
            <span className="text-darkOrange-7 font-semibold text-base leading-5">
              {rank}
            </span>
          </div>

          <button
            className="w-8.5 h-6.5 px-2 py-2.5 rounded-lg flex items-center justify-center transition-colors"
            onClick={onMoveDown}
            type="button"
          >
            <BsChevronDown className="size-4.5 text-black" />
          </button>
        </div>

        <div
          className={cn(
            'flex-1 p-2 bg-white border-t border-r border-b border-newGray-5 rounded-r-xl transition-all duration-200 flex flex-wrap items-center content-center',
            isDragging
              ? 'border-newGray-3 bg-newGray-6 opacity-50'
              : 'bg-white border-newGray-5',
            isDraggedOver && !isDragging
              ? 'border-darkOrange-3 bg-darkOrange-0'
              : '',
          )}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex flex-col">
              <div className="text-dashboardSectionTitle font-medium text-base leading-5">
                {name}
              </div>
              <div className="text-dashboardSectionTitle text-xs leading-4">
                {description}
              </div>
            </div>

            <Button
              variant="outline"
              mode="light"
              size="s"
              className="w-fit"
              asChild
            >
              <a href={fileUrl} target="_blank" rel="noreferrer">
                {t('dashboard.course.readAssignment')}
              </a>
            </Button>
          </div>

          <button
            className={cn(
              'size-4.5 rounded flex items-center justify-center transition-colors cursor-grab active:cursor-grabbing ml-2',
              isDragging && 'cursor-grabbing',
            )}
            type="button"
          >
            <LuGripVertical className="size-4.5 text-newGray-3" />
          </button>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:contents">
        <div className="size-15 border rounded-lg bg-darkOrange-0 border-darkOrange-1 flex items-center justify-center">
          <span className="text-darkOrange-7 display-small-med-32px">
            {rank}
          </span>
        </div>

        <div
          className={cn(
            'flex-1 px-4 py-1 border rounded-xl flex items-center gap-5 transition-all duration-200',
            isDragging
              ? 'border-newGray-3 bg-newGray-6 opacity-50'
              : 'bg-white border-newGray-5',
            isDraggedOver && !isDragging
              ? 'border-darkOrange-3 bg-darkOrange-0'
              : '',
          )}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="w-[34px] flex flex-col justify-between items-center h-full">
            <button
              className={cn(
                'h-6.5 px-2 py-2.5 rounded-lg hover:bg-newGray-5 flex items-center justify-center transition-colors',
                rank === 1 ? 'opacity-30 cursor-not-allowed' : '',
              )}
              onClick={rank === 1 ? undefined : onMoveUp}
              type="button"
              disabled={rank === 1}
            >
              <BsChevronUp className="size-4.5 text-black" />
            </button>
            <button
              className="h-6.5 px-2 py-2.5 rounded-lg hover:bg-newGray-5 flex items-center justify-center transition-colors"
              onClick={onMoveDown}
              type="button"
            >
              <BsChevronDown className="size-4.5 text-black" />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-1">
            <div className="text-dashboardSectionTitle label-med-18px">
              {name}
            </div>
            <div className="text-dashboardSectionTitle body-14px">
              {description}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <Button variant="outline" mode="light" size="s" asChild>
              <a href={fileUrl} target="_blank" rel="noreferrer">
                {t('dashboard.course.readAssignment')}
              </a>
            </Button>

            <button
              className={cn(
                'size-6 hover:bg-newGray-5 rounded flex items-center justify-center transition-colors cursor-grab active:cursor-grabbing',
                isDragging && 'cursor-grabbing',
              )}
              type="button"
            >
              <LuGripVertical className="size-4.5 text-newGray-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InformationalPanel = ({
  icon,
  title,
  subtitle,
  description,
  className,
  iconClassName,
}: {
  icon?: string;
  title?: string;
  subtitle?: string;
  description?: string | React.ReactNode;
  className?: string;
  iconClassName?: string;
}) => {
  return (
    <div
      className={cn(
        'flex w-full flex-col justify-center items-center gap-4 md:gap-8 px-4 py-5 md:p-8 bg-newGray-6 border border-newGray-5 rounded-2xl shadow-course-navigation text-center',
        className,
      )}
    >
      <div className="flex flex-col justify-center items-center gap-2.5 md:gap-5">
        {icon && (
          <img
            src={icon}
            alt={title}
            className={cn('w-7 md:w-9', iconClassName)}
          />
        )}
        {title && (
          <h3 className="text-newBlack-1 label-medium-med-16px md:label-large-med-20px">
            {title}
          </h3>
        )}
      </div>
      {subtitle && (
        <span className="text-darkOrange-5 display-medium-bold-caps-32px md:display-large-bold-caps-48px">
          {subtitle}
        </span>
      )}
      {description && (
        <p className="body-14px md:label-18px text-newBlack-1 whitespace-pre-line">
          {description}
        </p>
      )}
    </div>
  );
};

const ConfirmAssignmentsOrderDialog = ({
  onConfirm,
}: { onConfirm: () => void }) => {
  const isMobile = useSmaller('md');

  return (
    <BasicModal
      trigger={
        <Button
          variant="primary"
          mode="light"
          size={isMobile ? 'm' : 'l'}
          className="w-fit mx-auto"
        >
          {t('dashboard.course.saveList')}
        </Button>
      }
      title={t('dashboard.course.surePreferenceList')}
      content={
        <p className="text-center max-w-[442px] md:px-5">
          {t('dashboard.course.confirmNoEditable')}
        </p>
      }
      iconSrc={InformationIcon}
      showLogo
      contentClassName="w-[95%] max-md:max-w-100 md:w-[530px]"
    >
      <div className="!flex max-md:flex-wrap justify-center items-center gap-2.5 md:!gap-[30px]">
        <DialogClose asChild>
          <Button
            variant="primary"
            size={isMobile ? 'm' : 'l'}
            className="w-fit"
            onClick={onConfirm}
          >
            {t('dashboard.course.confirmList')}
            <IoCheckmark className="ml-2.5" />
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="outline"
            size={isMobile ? 'm' : 'l'}
            className="w-fit"
          >
            {t('dashboard.course.keepEditing')} <BiPencil className="ml-2.5" />
          </Button>
        </DialogClose>
      </div>
    </BasicModal>
  );
};

const ConfirmSubmissionDialog = ({
  onConfirm,
  selectedFile,
  isUploading,
}: {
  onConfirm: () => void;
  selectedFile: File | null;
  isUploading: boolean;
}) => {
  const isMobile = useSmaller('md');

  return (
    <BasicModal
      trigger={
        <Button
          variant="primary"
          mode="light"
          size="m"
          className="w-fit h-fit"
          disabled={!selectedFile || isUploading}
        >
          {t('words.submit')}
        </Button>
      }
      title={t('dashboard.course.isSubmissionFinal')}
      content={
        <p className="text-center max-w-[442px] md:px-5">
          {t('dashboard.course.confirmNoEditableFile')}
        </p>
      }
      iconSrc={InformationIcon}
      showLogo
      contentClassName="w-[95%] max-md:max-w-100 md:w-[530px]"
    >
      <div className="!flex max-md:flex-col justify-center items-center gap-2.5 md:!gap-[30px]">
        <DialogClose asChild>
          <Button
            variant="primary"
            size={isMobile ? 'm' : 'l'}
            className="w-fit"
            onClick={onConfirm}
          >
            {t('dashboard.course.confirmSubmission')}{' '}
            <IoCheckmark className="ml-2.5" />
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="outline"
            size={isMobile ? 'm' : 'l'}
            className="w-fit"
          >
            {t('courses.exam.goBack')} <RiArrowGoBackFill className="ml-2.5" />
          </Button>
        </DialogClose>
      </div>
    </BasicModal>
  );
};
