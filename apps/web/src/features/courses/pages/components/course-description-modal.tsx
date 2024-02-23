import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { t } from 'i18next';
import { BiCalendar } from 'react-icons/bi';
import { BsClock, BsHourglass } from 'react-icons/bs';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { HiOutlineBookOpen } from 'react-icons/hi';
import { IoPricetagOutline } from 'react-icons/io5';

import graduateImg from '../../../../assets/birrete.png';
import watch from '../../../../assets/cloclk.png';
import Book from '../../../../assets/courses/livre.svg?react';
import rabitPen from '../../../../assets/rabbit_holding_pen.svg';
import { Button } from '../../../../atoms/Button/index.tsx';
import { Modal } from '../../../../atoms/Modal/index.tsx';
import { ReactPlayer } from '../../../../components/ReactPlayer/index.tsx';
import { addSpaceToCourseId } from '../../../../utils/courses.ts';
import { computeAssetCdnUrl } from '../../../../utils/index.ts';
import type { TRPCRouterOutput } from '../../../../utils/trpc.ts';

type Course = NonNullable<TRPCRouterOutput['content']['getCourse']>;
const { useGreater } = BreakPointHooks(breakpointsTailwind);
interface CourseDescriptionModalProps {
  course: NonNullable<TRPCRouterOutput['content']['getCourse']>;
  satsPrice: number;
  isOpen: boolean;
  onClose: (isPaid?: boolean) => void;
  onPay: () => void;
}

export const CourseDescriptionModal = ({
  course,
  satsPrice,
  isOpen,
  onClose,
  onPay,
}: CourseDescriptionModalProps) => {
  const isScreenMd = useGreater('md');

  const courseName = `${addSpaceToCourseId(course.id)} - ${course.name}`;
  const professorNames = course?.professors
    .map((professor) => professor.name)
    .join(', ');

  const HeaderSmall = ({ course }: { course: Course }) => {
    return (
      <div className="grid grid-cols-3 text-blue-800 md:hidden">
        <div className=" col-span-2 flex-col space-y-2 p-3 sm:px-0">
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="m-1 flex shrink-0 items-center rounded bg-gray-200 px-2 py-1 shadow-md">
              <img src={rabitPen} alt="" className="mr-2 size-4" />
              <span>{professorNames}</span>
            </div>
            <div className="m-1 flex shrink-0 items-center rounded bg-gray-200 px-2 py-1 shadow-md">
              <img src={graduateImg} alt="" className="mr-2 size-4" />
              <span className="capitalize">{course.level}</span>
            </div>
            <div className="m-1 flex shrink-0 items-center rounded bg-gray-200 px-2 py-1 shadow-md">
              <Book />
              <span className="ml-2">
                {t('courses.details.mobile.chapters', {
                  chapters: course.chaptersCount,
                })}
              </span>
            </div>
            <div className="m-1 flex shrink-0 items-center rounded bg-gray-200 px-2 py-1 shadow-md">
              <img src={watch} alt="Icono de estudio" className="mr-2 size-4" />
              <span>
                {t('courses.details.mobile.hours', {
                  hours: course.hours,
                })}
              </span>
            </div>
          </div>
        </div>
        <div className="col-span-1 mx-auto justify-center self-center text-xl">
          <p>{satsPrice + ' sats'}</p>
        </div>
      </div>
    );
  };

  const HeaderBig = ({ course }: { course: Course }) => {
    return (
      <div className="hidden grid-cols-2 gap-4 text-sm md:grid lg:text-base">
        <div className="flex flex-col gap-8 p-3 sm:px-0">
          <div className="flex flex-row gap-5">
            <FaChalkboardTeacher size="35" className="text-orange-600" />
            <span className="font-body w-full rounded bg-gray-200 px-3 py-1 text-blue-900">
              {course.professors?.length > 1
                ? t('courses.details.teachers', {
                    teachers: professorNames,
                  })
                : t('courses.details.teacher', {
                    teacher: professorNames,
                  })}
            </span>
          </div>
          <div className="flex flex-row gap-5 ">
            <BiCalendar size="35" className="text-orange-600" />
            <span className="font-body w-full rounded bg-gray-200 px-3 py-1 text-blue-900">
              {t('courses.details.date', {
                startDate: course.paidStartDate
                  ? new Date(course.paidStartDate).toLocaleDateString()
                  : '',
                endDate: course.paidEndDate
                  ? new Date(course.paidEndDate).toLocaleDateString()
                  : '',
              })}
            </span>
          </div>
          <div className="flex flex-row gap-5 ">
            <IoPricetagOutline size="35" className="text-orange-600" />
            <span className="font-body w-full rounded bg-gray-200 px-3 py-1 text-blue-900">
              {t('courses.details.price', {
                price: satsPrice,
              })}
            </span>
          </div>
        </div>
        <div className="flex-col space-y-8 p-3 sm:px-0">
          <div className="flex flex-row gap-5 ">
            <HiOutlineBookOpen size="35" className="text-orange-600" />
            <span className="font-body w-full rounded bg-gray-200 px-3 py-1 text-blue-900">
              {t('courses.details.numberOfChapters', {
                number: course.chaptersCount,
              })}
            </span>
          </div>
          <div className="flex flex-row gap-5 ">
            <BsClock size="35" className="text-orange-600" />
            <span className="font-body w-full rounded bg-gray-200 px-3 py-1 text-blue-900">
              {t('courses.details.duration', { hours: course.hours })}
            </span>
          </div>
          <div className="flex flex-row gap-5 ">
            <BsHourglass size="35" className="text-orange-600" />
            <span className="font-body w-full rounded bg-gray-200 px-3 py-1 text-blue-900">
              {t('courses.details.accessible')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const Content = () => {
    return (
      <div className="grid grid-cols-1 gap-4 md:mt-6 md:grid-cols-2">
        <div>
          <p className="mt-2 whitespace-pre-wrap text-xs text-gray-800">
            {course.paidDescription}
          </p>

          <a
            href={computeAssetCdnUrl(
              course.lastCommit,
              `courses/${course.id}/assets/curriculum.pdf`,
            )}
            target="_blank"
            download
            rel="noreferrer"
          >
            <Button
              variant="download"
              size="s"
              className="float-right mt-6 md:float-left"
              type="button"
            >
              {t('courses.details.downloadCurriculum')}
            </Button>
          </a>
        </div>
        <div>
          <ReactPlayer
            width={'100%'}
            style={{ top: 0, left: 0 }}
            className="mx-auto mb-2 max-h-[300px] rounded-lg"
            controls={true}
            url={course.paidVideoLink as string}
          />
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} headerText={courseName}>
      <div className="min-w-[85vw] lg:min-w-[55rem]">
        <HeaderSmall course={course} />
        <HeaderBig course={course} />
        <Content />
        <div className="mt-8 flex flex-row items-center">
          <div className="text-[10px] uppercase md:text-xs">
            <span>{t('courses.details.terms1')} </span>
            <a href={'/terms-and-conditions'} target="_blank" rel="noreferrer">
              <span className="text-orange-500">
                {t('courses.details.terms2')}{' '}
              </span>
            </a>
            <span>{t('courses.details.terms3')}</span>
          </div>
          <Button
            variant="tertiary"
            onClick={onPay}
            className="ml-auto mt-2"
            size={isScreenMd ? 'm' : 's'}
          >
            {t('words.purchase')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
