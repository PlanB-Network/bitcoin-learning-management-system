import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { Link, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { BsCheckCircle, BsCircleFill } from 'react-icons/bs';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { HiOutlineAcademicCap, HiOutlineBookOpen } from 'react-icons/hi';
import { IoMdStopwatch } from 'react-icons/io';
import { RxTriangleDown } from 'react-icons/rx';
import ReactMarkdown from 'react-markdown';

import graduateImg from '../../../assets/birrete.png';
import watch from '../../../assets/cloclk.png';
import checkBoxSVG from '../../../assets/courses/checkboxFilled.svg';
import crayonSVG from '../../../assets/courses/Crayon.svg';
import curriculumImage from '../../../assets/courses/curriculum.png';
import Book from '../../../assets/courses/livre.svg?react';
import rocketSVG from '../../../assets/courses/rocketcourse.svg';
import staricon from '../../../assets/courses/star.png';
import yellowNote from '../../../assets/courses/yellowbook.png';
import RabbitHikingModal from '../../../assets/rabbit-modal-auth.svg?react';
import rabitPen from '../../../assets/rabbit_holding_pen.svg';
import { Button } from '../../../atoms/Button';
import { useNavigateMisc } from '../../../hooks';
import { computeAssetCdnUrl, trpc } from '../../../utils';
import { CourseButton } from '../components/course-button';
import { CourseLayout } from '../layout';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const CourseDetails: React.FC = () => {
  const { courseId, language } = useParams({
    from: '/courses/$courseId',
  });

  const { navigateTo404 } = useNavigateMisc();

  const { t, i18n } = useTranslation();
  const isScreenMd = useGreater('sm');
  const isScreenLg = useGreater('md');

  const { data: course, isFetched } = trpc.content.getCourse.useQuery({
    id: courseId,
    language: language ?? i18n.language,
  });

  if (!course && isFetched) navigateTo404();

  return (
    <CourseLayout>
      <div>
        <CourseButton courseId={courseId} />
        {course && (
          <div className="flex h-full w-full flex-col items-center justify-center px-2 py-6 md:py-10">
            <div className="flex max-w-5xl flex-col space-y-2 px-2 md:flex-row md:items-center md:space-x-10">
              {isScreenLg ? (
                <div
                  className="flex shrink-0 grow-0 flex-col items-center justify-center rounded-full bg-orange-500 p-8 text-5xl font-bold uppercase text-white"
                  title={t('courses.details.courseId', { courseId: course.id })}
                >
                  <span>{course.id.match(/\d+/)?.[0] || ''}</span>
                </div>
              ) : (
                <div className="mb-4 flex flex-col items-center ">
                  <div className="mt-2 flex items-center">
                    <div
                      className="h-fit w-fit rounded-xl bg-orange-800 p-2 text-left text-4xl font-bold uppercase text-white"
                      title={t('courses.details.courseId', {
                        courseId: course.id,
                      })}
                    >
                      {course.id}
                    </div>
                    <h1 className="px-1 text-xl font-semibold text-blue-800 lg:text-5xl">
                      {course.name}
                    </h1>
                  </div>
                  <h2 className="mt-2 text-sm font-light italic text-blue-800">
                    {t('courses.details.goal', { goal: course.goal })}
                  </h2>
                  {/* Aqui se muestran los datos del curso cel version */}
                  <div className="flex flex-col space-y-2 p-3 md:px-0">
                    <div className="flex flex-wrap ">
                      <div className="m-1 flex shrink-0 items-center rounded bg-gray-200 px-2 py-1 shadow-md">
                        <img src={rabitPen} alt="" className="mr-2 h-4 w-4" />
                        <span className="text-sm text-blue-800">
                          {course.teacher}
                        </span>
                      </div>
                      <div className="m-1 flex shrink-0 items-center rounded bg-gray-200 px-2 py-1 shadow-md">
                        <img
                          src={graduateImg}
                          alt=""
                          className="mr-2 h-4 w-4"
                        />
                        <span className="text-sm capitalize text-blue-800">
                          {course.level}
                        </span>
                      </div>
                      <div className="m-1 flex shrink-0 items-center rounded bg-gray-200 px-2 py-1 shadow-md">
                        <Book />
                        <span className="text-sm text-blue-800">
                          {t('courses.details.mobile.chapters', {
                            chapters: course.chaptersCount,
                          })}
                        </span>
                      </div>
                      <div className="m-1 flex shrink-0 items-center rounded bg-gray-200 px-2 py-1 shadow-md">
                        <img
                          src={watch}
                          alt="Icono de estudio"
                          className="mr-2 h-4 w-4"
                        />
                        <span className="text-sm text-blue-800">
                          {t('courses.details.mobile.hours', {
                            hours: course.hours,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Agregamos clases para ocultar el div en dispositivos móviles */}
              <div className="hidden md:block lg:block xl:block 2xl:block">
                <h1 className="text-3xl  font-semibold text-blue-800  lg:text-5xl">
                  {course.name}
                </h1>
                <h2 className="mt-4 text-lg font-light italic text-blue-800">
                  {t('courses.details.goal', { goal: course.goal })}
                </h2>
              </div>
            </div>
            <hr className="invisible my-8 w-full max-w-5xl border-2 border-gray-300 md:visible lg:visible" />
            <div className="grid max-w-5xl grid-rows-2 place-items-stretch justify-items-stretch gap-y-8 md:my-2 md:grid-cols-2 md:grid-rows-1">
              <div className="w-full px-2 md:pl-2 md:pr-10">
                <img
                  src={computeAssetCdnUrl(
                    course.last_commit,
                    `courses/${course.id}/assets/thumbnail.png`,
                  )}
                  alt=""
                />
              </div>
              <div className="hidden w-full flex-col space-y-5 p-3 md:block md:px-0 lg:block xl:block 2xl:block ">
                <div className="flex flex-row items-start space-x-5 ">
                  <FaChalkboardTeacher size="35" className="text-orange-600" />
                  <span className="font-body w-full rounded bg-gray-200 px-3 py-1 text-blue-900">
                    {t('courses.details.teachers', {
                      teachers: t('words.rogzy'),
                    })}
                  </span>
                </div>
                <div className="flex flex-row items-start space-x-5">
                  <HiOutlineAcademicCap size="35" className="text-orange-600" />
                  <span className="font-body w-full rounded bg-gray-200 px-3 py-1 text-blue-900">
                    {t(`courses.details.level`, { level: course.level })}
                  </span>
                </div>
                <div className="flex flex-row items-start space-x-5">
                  <HiOutlineBookOpen size="35" className="text-orange-600" />
                  <span className="font-body w-full rounded bg-gray-200 px-3 py-1 text-blue-900">
                    {t('courses.details.numberOfChapters', {
                      number: course.chaptersCount,
                    })}
                  </span>
                </div>
                <div className="flex flex-row items-start space-x-5">
                  <IoMdStopwatch size="35" className="text-orange-600" />
                  <span className="font-body w-full rounded bg-gray-200 px-3 py-1 text-blue-900">
                    {t('courses.details.duration', { hours: course.hours })}
                  </span>
                </div>
              </div>
            </div>
            <div className="relative my-8 w-full max-w-5xl flex-col space-y-2 px-2 md:flex-row md:items-center md:space-x-10">
              {isScreenLg ? (
                <div>
                  <hr className="border-2 border-gray-300" />
                  <div className="absolute right-[15%] top-[50%] -translate-y-1/2">
                    <div className="relative">
                      <Link
                        to={'/courses/$courseId/$partIndex/$chapterIndex'}
                        params={{
                          courseId,
                          partIndex: '1',
                          chapterIndex: '1',
                        }}
                      >
                        <Button variant="tertiary" rounded>
                          <span className="md:px-6">Start the course</span>
                        </Button>
                      </Link>
                      <RabbitHikingModal className="absolute bottom-1 left-1 z-[+1] h-14 -translate-x-1/2" />
                    </div>
                  </div>
                </div>
              ) : (
                <div flex-row>
                  <div className="flex items-center justify-center">
                    <div className="h-0 grow border-t-2 border-orange-600"></div>
                    <div className=" p-2">
                      <div className=" mx-1 flex items-center justify-center">
                        <Link
                          to={'/courses/$courseId/$partIndex/$chapterIndex'}
                          params={{
                            courseId,
                            partIndex: '1',
                            chapterIndex: '1',
                          }}
                        >
                          <div className="flex">
                            <Button variant="tertiary" rounded>
                              <span className="relative z-10 text-sm font-normal md:px-6	">
                                Start the course
                              </span>
                              <img
                                src={rocketSVG}
                                alt=""
                                className="m-0 h-5 w-5 "
                              />
                            </Button>
                          </div>
                        </Link>
                      </div>
                    </div>
                    <div className="h-0 grow border-t-2 border-orange-600"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="my-4 max-w-5xl grid-rows-2 place-items-stretch justify-items-stretch px-2 md:grid md:grid-cols-2 md:grid-rows-1 md:gap-x-20">
              <div className="mb-5 flex w-full flex-col md:mb-0">
                <div className="flex flex-row sm:hidden">
                  <img
                    src={crayonSVG}
                    alt=""
                    className="m-0 block h-5  w-5   "
                  />
                  <h4 className="mb-1 text-sm font-semibold uppercase italic text-blue-900 sm:hidden">
                    {t('courses.details.description')}
                  </h4>
                </div>
                <h4 className="mb-1 hidden text-sm font-normal uppercase italic sm:block">
                  {t('courses.details.description')}
                </h4>
                <ReactMarkdown
                  children={course.raw_description}
                  components={{
                    h1: ({ children }) => (
                      <h3 className="mb-5 text-base font-normal text-blue-800 sm:text-2xl sm:font-normal sm:text-blue-900">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-3 text-justify text-xs text-blue-800 sm:text-sm ">
                        {children}
                      </p>
                    ),
                  }}
                ></ReactMarkdown>
              </div>
              <div className="flex w-full flex-col">
                <div className="mb-3 flex flex-row sm:hidden">
                  <img
                    src={staricon}
                    alt=""
                    className=" block h-5 w-5  p-1   "
                  />
                  <h4 className="mb-1 py-1 text-xs font-semibold uppercase italic text-blue-800 sm:hidden">
                    {t('courses.details.objectives')}
                  </h4>
                </div>
                <h4 className="mb-1 hidden text-sm font-light uppercase italic sm:block">
                  {t('courses.details.objectives')}
                </h4>
                <h3 className="mb-5 hidden text-2xl font-normal  text-blue-900 sm:block md:text-2xl lg:text-xl xl:text-lg 2xl:text-lg">
                  {t('courses.details.objectivesTitle')}
                </h3>
                <ul className="space-y-2 text-xs font-light capitalize text-blue-800 sm:text-base sm:uppercase">
                  {course.objectives?.map((goal, index) => (
                    <li className="flex flex-row space-x-3" key={index}>
                      <div>
                        <BsCheckCircle className="mt-1 hidden h-4 w-4 sm:block" />
                      </div>
                      <img
                        src={checkBoxSVG}
                        alt=""
                        className="mt-1 block h-4 w-4 sm:hidden"
                      />
                      <span className="p-1">{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <hr className="my-4 hidden w-full max-w-5xl border-2 border-gray-300 sm:block md:my-8 " />
            <div className="my-4 h-fit max-w-5xl grid-cols-2 place-items-stretch justify-items-stretch gap-x-20 px-2 md:grid">
              <div className="flex h-fit flex-col">
                <div className="mb-3 flex flex-row sm:hidden">
                  <img
                    src={yellowNote}
                    alt=""
                    className="m-0 block h-5  w-5   "
                  />
                  <h4 className="mb-1 text-sm font-semibold  uppercase italic text-blue-900 sm:hidden">
                    {t('courses.details.curriculum')}
                  </h4>
                </div>
                <h4 className="mb-5 hidden text-2xl font-light uppercase italic text-gray-400 sm:block">
                  {t('courses.details.curriculum')}
                </h4>
                <ul className="ml-5 space-y-5 text-xs capitalize sm:text-base sm:uppercase">
                  {course.parts?.map((part, partIndex) => (
                    <li key={partIndex}>
                      <div className="mb-1 flex flex-row">
                        <RxTriangleDown
                          className="mr-2 mt-1 text-orange-500"
                          size={20}
                        />
                        <Link
                          to={'/courses/$courseId/$partIndex/$chapterIndex'}
                          params={{
                            courseId,
                            partIndex: partIndex.toString(),
                            chapterIndex: '1',
                          }}
                        >
                          <p className="ml-1 text-base font-normal capitalize text-orange-500 sm:text-lg sm:uppercase">
                            {part.title}
                          </p>
                        </Link>
                      </div>
                      {part.chapters?.map((chapter, index) => (
                        <div
                          className="mb-0.5 ml-10 flex flex-row items-center"
                          key={index}
                        >
                          <BsCircleFill
                            className="mr-2 text-blue-500"
                            size={7}
                          />
                          <Link
                            to={'/courses/$courseId/$partIndex/$chapterIndex'}
                            params={{
                              courseId,
                              partIndex: partIndex.toString(),
                              chapterIndex: chapter.chapter.toString(),
                            }}
                          >
                            <p className="capitalize text-blue-700">
                              {chapter.title}
                            </p>
                          </Link>
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
              {isScreenMd && (
                <div className="h-4/5">
                  <img
                    className="h-full w-full object-contain"
                    src={curriculumImage}
                    alt=""
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </CourseLayout>
  );
};
