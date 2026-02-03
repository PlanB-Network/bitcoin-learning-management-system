import type { CourseProgressExtended } from '@blms/types';
import { Progress } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { TbChevronRight } from 'react-icons/tb';
import OrangePill from '#src/assets/icons/orange_pill_color.svg';
import { useSmaller } from '#src/hooks/use-smaller.ts';

interface InProgressCourseCardProps {
  course: {
    id: string;
    name: string;
  };
  courseProgress: CourseProgressExtended;
}

export const InProgressCourseCard = ({
  course,
  courseProgress,
}: InProgressCourseCardProps) => {
  const { t } = useTranslation();
  const isMobile = useSmaller('md') || window.innerWidth < 768;

  return (
    <Link
      className="flex items-center justify-between w-full p-3 md:px-8 md:py-4 gap-2 border-b border-neutral-100 last-of-type:border-none group hover:bg-neutral-50"
      to={`/courses/${course.id}/${courseProgress?.nextChapter?.chapterId}`}
      key={course.id}
    >
      <span className="body-small-bold md:subtitle-base text-black">
        {course.name}
      </span>
      <div className="flex items-center gap-2 md:gap-8 xl:w-full xl:max-w-[341px]">
        <div className="flex items-center gap-4 w-full justify-end">
          <span className="body-extra-small-bold md:subtitle-base text-orange-500">
            {courseProgress.progressPercentage}%
          </span>
          <div className="w-full max-w-[272px] relative max-xl:hidden">
            <Progress
              total={courseProgress.totalChapters}
              completed={courseProgress.completedChaptersCount}
              pillImage={OrangePill}
            />
          </div>
        </div>
        <div className="body-small-bold text-neutral-300 group-hover:text-orange-500 flex items-center">
          {isMobile ? (
            <TbChevronRight size={16} />
          ) : (
            <>
              <span>{t('words.resume')}</span>
              <TbChevronRight size={20} />
            </>
          )}
        </div>
      </div>
    </Link>
  );
};
