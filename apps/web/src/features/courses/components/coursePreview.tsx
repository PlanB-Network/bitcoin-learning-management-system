import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { BsArrowRight } from 'react-icons/bs';

import { JoinedCourse } from '@sovereign-university/types';

import { Button } from '../../../atoms/Button';
import { Card } from '../../../atoms/Card';
import { compose, computeAssetCdnUrl } from '../../../utils';

interface CoursePreviewProps {
  course: JoinedCourse;
  className?: string;
}

export const CoursePreview = ({
  course,
  className = '',
}: CoursePreviewProps) => {
  const { t } = useTranslation();

  return (
    <Card
      className={compose(
        'overflow-hidden border-2 border-orange-800  sm:border-4',
      )}
    >
      <div className=" flex-row">
        <img
          src={computeAssetCdnUrl(
            course.last_commit,
            `courses/${course.id}/assets/thumbnail.png`,
          )}
          alt="Course Thumbnail"
          className="hidden md:w-auto"
        />
        <div className="flex h-full flex-col">
          <h5 className="text-blue-1000 text-xs font-semibold uppercase tracking-tight sm:text-xl">
            {course.name}
          </h5>
          <h6 className="mt-2 text-xs font-light sm:text-xs">
            {t('courses.preview.by', { teacher: course.teacher })}
          </h6>
          <div className="mt-1 overflow-hidden text-ellipsis text-xs italic tracking-wide text-gray-600 sm:mt-3 sm:line-clamp-4 sm:text-sm">
            {course.goal}
          </div>
          <div className="mt-5 hidden w-full grow flex-row items-end justify-end self-end justify-self-end sm:flex">
            <Link to={'/courses/$courseId'} params={{ courseId: course.id }}>
              <Button
                size="s"
                iconRight={<BsArrowRight />}
                variant="tertiary"
                className="text-blue-1000"
              >
                {t('courses.preview.letsgo')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};
