import { Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { BsArrowRight } from 'react-icons/bs';

import type { JoinedCourseWithProfessors } from '@blms/types';
import { Button, Card } from '@blms/ui';

import { useGreater } from '#src/hooks/use-greater.js';

import { compose, computeAssetCdnUrl } from '../utils/index.ts';
import { joinWords } from '../utils/string.ts';

interface CourseCardProps {
  course: JoinedCourseWithProfessors;
  selected: boolean;
}

export const CourseCard = ({ course, selected }: CourseCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isScreenMd = useGreater('md');

  function handleCardClick() {
    if (!isScreenMd) {
      navigate({ to: '/courses/$courseId', params: { courseId: course.id } });
    }
  }

  return (
    <Card
      withPadding={false}
      className={compose(
        'overflow-hidden border-2 border-orange-500 relative md:border-4 !p-0',
        selected
          ? ''
          : 'after:top-0 after:left-0 after:w-full after:h-full after:absolute after:bg-black after:bg-opacity-50 after:content-[""]',
      )}
    >
      <button
        className="relative flex h-full cursor-pointer flex-row items-center md:cursor-auto md:flex-col text-left"
        onClick={handleCardClick}
      >
        <div className="flex w-[100px] flex-col items-center md:w-auto">
          <span className="inline font-bold uppercase text-orange-500 md:hidden">
            {course.id}
          </span>
          <img
            src={computeAssetCdnUrl(
              course.lastCommit,
              `courses/${course.id}/assets/thumbnail.webp`,
            )}
            alt="Course Thumbnail"
            className="ml-2 h-20 max-w-[100px] rounded-lg md:ms-0 md:h-auto md:w-full md:max-w-none md:rounded-none"
          />
        </div>
        <div className="flex h-full flex-col px-5 py-3">
          <h5 className="text-blue-1000 font-semibold uppercase tracking-tight">
            <span className="hidden text-base md:inline">
              {course.id} - {course.name}
            </span>
            <span className="inline text-base md:hidden">{course.name}</span>
          </h5>
          <hr className="border-blue-1000 mt-1 hidden w-24 md:inline" />
          <h6 className="mt-2 hidden text-xs font-light italic text-gray-700 md:block md:text-xs">
            {t('courses.preview.by', {
              professor: joinWords(
                course.professors
                  .map((p) => p.name)
                  .filter((name): name is string => name !== undefined),
              ),
            })}
          </h6>
          <div className="text-blue-1000 mt-1 overflow-hidden text-ellipsis text-xs italic tracking-wide md:mt-3 md:line-clamp-4 md:text-sm">
            {course.goal}
          </div>
          <div className="mb-auto mt-5 hidden w-full cursor-vertical-text flex-row justify-end md:flex">
            <p className="h-8"></p>
            <Link
              className="absolute bottom-2"
              to={'/courses/$courseId'}
              params={{ courseId: course.id }}
            >
              <Button size="s" iconRight={<BsArrowRight />} variant="tertiary">
                {t('courses.preview.letsgo')}
              </Button>
            </Link>
          </div>
        </div>
      </button>
    </Card>
  );
};
