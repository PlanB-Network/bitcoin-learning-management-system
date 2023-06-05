import { useTranslation } from 'react-i18next';
import { BsArrowRight } from 'react-icons/bs';

import { JoinedCourse } from '@sovereign-academy/types';

import { Avatar } from '../../atoms/Avatar';
import { Button } from '../../atoms/Button';
import { Card } from '../../atoms/Card';
import { Tag } from '../../atoms/Tag';
import { compose } from '../../utils';

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
      image={`http://localhost:8080/${course.last_commit}/courses/${course.id}/assets/thumbnail.png`}
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
          <Button
            size="s"
            iconRight={<BsArrowRight />}
            variant="tertiary"
            className="text-primary-900"
          >
            {t('courses.preview.letsgo')}
          </Button>
        </div>
      </div>
    </Card>
  );
};
