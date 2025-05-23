import { Alert, AlertDescription, AlertTitle, Button, cn } from '@blms/ui';
import { t } from 'i18next';
import { useState } from 'react';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { LuCircleAlert, LuGripVertical } from 'react-icons/lu';
import FailFace from '#src/assets/icons/face_failed.svg';
import { CollapsibleDropdown } from '#src/components/Dropdown/collapsible-dropdown.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { trpc } from '#src/utils/trpc.ts';

interface RankingItemProps {
  companyName: string;
  projectName: string;
  rank?: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onReadAssignment?: () => void;
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
  const isMobile = useSmaller('md');

  const [assignments, setAssignments] = useState([
    {
      companyName: 'Tether',
      companyId: 'tether',
      projectName: 'Implementation of a new feature',
    },
    {
      companyName: 'Braiins',
      companyId: 'braiins',
      projectName: 'Arbitraging energy with bitcoin mining',
    },
    {
      companyName: 'Ledger',
      companyId: 'ledger',
      projectName:
        'Very long project name that is not going to fit to see if the text is cut off or if it goes to the next line',
    },
  ]);

  const { data: userProgress } = trpc.user.courses.getProgress.useQuery({
    courseId,
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newAssignments = [...assignments];
      [newAssignments[index], newAssignments[index - 1]] = [
        newAssignments[index - 1],
        newAssignments[index],
      ];
      setAssignments(newAssignments);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < assignments.length - 1) {
      const newAssignments = [...assignments];
      [newAssignments[index], newAssignments[index + 1]] = [
        newAssignments[index + 1],
        newAssignments[index],
      ];
      setAssignments(newAssignments);
    }
  };

  const handleReadAssignment = (companyId: string) => {
    console.log('Open a pdf file for:', companyId);
  };

  const handleSaveList = () => {
    console.log('Save the list of assignments');
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

    const newAssignments = [...assignments];
    const draggedItem = newAssignments[draggedIndex];

    newAssignments.splice(draggedIndex, 1);
    newAssignments.splice(dropIndex, 0, draggedItem);

    setAssignments(newAssignments);
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  const openAssignmentDate = new Date('2025-06-02T02:00:00Z').getTime();

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
          defaultOpen={true}
          type="info"
        >
          <p className="whitespace-pre-line text-newBlack-4 body-14px md:body-16px ">
            {t('dashboard.course.assignmentDescription')}
          </p>
        </CollapsibleDropdown>
      </div>

      {(userProgress?.[0].isSelectedForAssignment ||
        new Date().getTime() < openAssignmentDate) && (
        <>
          <div className="flex flex-col gap-4 md:gap-5">
            <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
              {t('dashboard.course.rankProjectPreferences')}
            </h2>

            <Alert hasCloseButton variant="warning">
              <AlertTitle icon={LuCircleAlert}>
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
          </div>
          {new Date().getTime() >= openAssignmentDate &&
            userProgress?.[0].isSelectedForAssignment && (
              <>
                <div className="flex flex-col gap-4">
                  <span className="subtitle-small-caps-14px text-newBlack-5">
                    {t('dashboard.course.mostPreferred')}
                  </span>

                  {assignments.map((assignment, index) => (
                    <RankingItem
                      key={assignment.companyId}
                      companyName={assignment.companyName}
                      projectName={assignment.projectName}
                      rank={index + 1}
                      index={index}
                      onMoveUp={() => handleMoveUp(index)}
                      onMoveDown={() => handleMoveDown(index)}
                      onReadAssignment={() =>
                        handleReadAssignment(assignment.companyId)
                      }
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
                <Button
                  variant="primary"
                  mode="light"
                  size={isMobile ? 'm' : 'l'}
                  className="w-fit mx-auto"
                  onClick={handleSaveList}
                >
                  {t('dashboard.course.saveList')}
                </Button>
              </>
            )}
        </>
      )}

      {!userProgress?.[0].isSelectedForAssignment &&
        new Date().getTime() >= openAssignmentDate && (
          <InformationalPanel
            icon={FailFace}
            description={t('dashboard.course.notSelectedAssignment')}
          />
        )}
    </section>
  );
};

const RankingItem = ({
  companyName,
  projectName,
  rank = 1,
  onMoveUp,
  onMoveDown,
  onReadAssignment,
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
                {companyName}
              </div>
              <div className="text-dashboardSectionTitle text-xs leading-4">
                {projectName}
              </div>
            </div>

            <Button
              variant="outline"
              mode="light"
              size="s"
              onClick={onReadAssignment}
              className="w-fit"
            >
              {t('dashboard.course.readAssignment')}
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
              {companyName}
            </div>
            <div className="text-dashboardSectionTitle body-14px">
              {projectName}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <Button
              variant="outline"
              mode="light"
              size="s"
              onClick={onReadAssignment}
            >
              {t('dashboard.course.readAssignment')}
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
}: {
  icon?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'flex w-full flex-col justify-center items-center gap-4 md:gap-8 px-4 py-5 md:p-8 bg-newGray-6 border border-newGray-5 rounded-2xl shadow-course-navigation text-center',
        className,
      )}
    >
      <div className="flex flex-col justify-center items-center gap-2.5 md:gap-5">
        {icon && <img src={icon} alt={title} className="w-7 md:w-9" />}
        {title && (
          <h3 className="text-newBlack-1 label-medium-med-16px md:label-large-med-20px">
            {title}
          </h3>
        )}
      </div>
      {subtitle && (
        <span className="text-darkOrange-5 display-medium-bold-caps-32px display-large-bold-caps-48px">
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
