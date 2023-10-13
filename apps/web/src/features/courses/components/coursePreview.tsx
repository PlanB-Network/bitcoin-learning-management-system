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
      withPadding={false}
      className={compose(
        'overflow-hidden border-2 border-orange-800  sm:border-4 !p-0',
      )}
    >
      <div className="relative h-full flex-row">
        <img
          src={computeAssetCdnUrl(
            course.last_commit,
            `courses/${course.id}/assets/thumbnail.png`,
          )}
          alt="Course Thumbnail"
          className="w-full"
        />
        <div className="flex h-full flex-col px-5 py-3">
          <h5 className="text-blue-1000 text-xs font-semibold uppercase tracking-tight sm:text-xl">
            {course.name}
          </h5>
          <h6 className="mt-2 text-xs font-light sm:text-xs">
            {t('courses.preview.by', { teacher: course.teacher })}
          </h6>
          <div className="text-blue-1000 mt-1 overflow-hidden text-ellipsis text-xs italic tracking-wide sm:mt-3 sm:line-clamp-4 sm:text-sm">
            {course.goal}
          </div>
          <div className="mb-auto mt-5 hidden w-full cursor-vertical-text flex-row justify-end sm:flex">
            <p className="h-8"></p>
            <Link
              className="absolute bottom-2"
              to={'/courses/$courseId'}
              params={{ courseId: course.id }}
            >
              <Button
                size="s"
                iconRight={<BsArrowRight />}
                variant="tertiary"
                className="text-blue-1000 relative mb-auto"
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
