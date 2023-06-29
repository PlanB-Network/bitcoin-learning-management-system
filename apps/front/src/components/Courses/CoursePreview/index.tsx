import { useTranslation } from 'react-i18next';
import { BsArrowRight } from 'react-icons/bs';
import { Link, generatePath } from 'react-router-dom';

import { JoinedCourse } from '@sovereign-academy/types';

import { Button } from '../../../atoms/Button';
import { Card } from '../../../atoms/Card';
import { Routes } from '../../../types';
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
      image={computeAssetCdnUrl(
        course.last_commit,
        `courses/${course.id}/assets/thumbnail.png`
      )}
      className={compose(
        'overflow-hidden border-4 border-orange-800',
        className
      )}
    >
      <div className="flex h-full flex-col">
        <h5 className="text-primary-900 text-xl font-semibold uppercase tracking-tight">
          {course.name}
        </h5>
        <h6 className="mt-2 text-xs font-thin">
          {t('courses.preview.by', { teacher: course.teacher })}
        </h6>
        <div className="mt-3 line-clamp-4 overflow-hidden text-ellipsis text-sm italic tracking-wide text-gray-600">
          {course.goal}
        </div>
        <div className="mt-5 flex w-full grow flex-row items-end justify-end self-end justify-self-end">
          <Link to={generatePath(Routes.Course, { courseId: course.id })}>
            <Button
              size="s"
              iconRight={<BsArrowRight />}
              variant="tertiary"
              className="text-primary-900"
            >
              {t('courses.preview.letsgo')}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
