import { title } from 'process';

import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useTranslation } from 'react-i18next';
import { BsCheckCircle, BsCircleFill } from 'react-icons/bs';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { HiOutlineAcademicCap, HiOutlineBookOpen } from 'react-icons/hi';
import { IoMdStopwatch } from 'react-icons/io';
import { RxTriangleDown } from 'react-icons/rx';
import ReactMarkdown from 'react-markdown';
import { Link, generatePath, useNavigate } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import graduateImg from '../../../assets/birrete.png';
import watch from '../../../assets/cloclk.png';
import checkBoxSVG from '../../../assets/courses/checkboxFilled.svg';
import crayonSVG from '../../../assets/courses/Crayon.svg';
import curriculumImage from '../../../assets/courses/curriculum.png';
import rocketSVG from '../../../assets/courses/rocketcourse.svg';
import staricon from '../../../assets/courses/star.png';
import yellowNote from '../../../assets/courses/yellowbook.png';
import book from '../../../assets/livre.svg';
import rabbitHikingModal from '../../../assets/rabbit-modal-auth.svg';
import rabitPen from '../../../assets/rabbit-with-pen.svg';
import { Button } from '../../../atoms/Button';
import { CourseButton } from '../../../components/Courses/CourseButton';
import { CourseLayout } from '../../../components/Courses/CourseLayout';
import { Routes } from '../../../types';
import { computeAssetCdnUrl, useRequiredParams } from '../../../utils';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const CourseDetails: React.FC = () => {
  const { courseId, language } = useRequiredParams();

  const navigate = useNavigate();

  const { t, i18n } = useTranslation();
  const isScreenMd = useGreater('sm');
  const isScreenLg = useGreater('md');

  const { data: course, isFetched } = trpc.content.getCourse.useQuery({
    id: courseId,
    language: language ?? i18n.language,
    includeChapters: true,
  });

  if (!course && isFetched) navigate('/404');

  return (
    <CourseLayout>
      <div>
        <CourseButton firstChapterRoute={`/course/${courseId}/chapter/1`} />
        {course && (
          <div className="flex h-full w-full flex-col items-center justify-center px-2 py-6 md:py-10">
            <div className="flex max-w-5xl flex-col space-y-2 px-2 md:flex-row md:items-center md:space-x-10">
              {isScreenLg ? (
                <div
                  className="flex flex-col items-center justify-center rounded-full bg-orange-800 p-8 text-5xl font-bold uppercase text-white"
                  title={t('courses.details.courseId', { courseId: course.id })}
                >
                  <span>{course.id.match(/[A-Za-z]+/)?.[0] || ''}</span>
                  <span>{course.id.match(/\d+/)?.[0] || ''}</span>
                </div>
              ) : (
                <div className="mb-4 flex flex-col items-center ">
                  <div className="mt-2  flex items-center">
                    <div
                      className="h-fit w-fit rounded-xl bg-orange-800 p-2 text-left text-4xl font-bold uppercase text-white"
                      title={t('courses.details.courseId', {
                        courseId: course.id,
                      })}
                    >
                      {course.id}
                    </div>
                    <h1 className="text-primary-700 px-1 text-xl font-semibold lg:text-5xl">
                      {course.name}
                    </h1>
                  </div>
                  <h2 className="text-primary-700 mt-2 text-sm font-light italic">
                    {t('courses.details.goal', { goal: course.goal })}
                  </h2>
                  {/* Aqui se muestran los datos del curso cel version */}
                  <div className="flex flex-col space-y-2 p-3 md:px-0">
                    <div className="flex flex-wrap ">
                      <div className="m-1 flex shrink-0 items-center rounded bg-gray-200 px-2 py-1 shadow-md">
                        <img
                          src={rabitPen}
                          alt="Icono de estudio"
                          className="mr-2 h-4 w-4"
                        />
                        <span className="text-primary-500 text-sm">
                          {course?.teacher}
                        </span>
                      </div>
                      <div className="m-1 flex shrink-0 items-center rounded bg-gray-200 px-2 py-1 shadow-md">
                        <img
                          src={graduateImg}
                          alt="Icono de estudio"
                          className="mr-2 h-4 w-4"
                        />
                        <span className="text-primary-500 text-sm capitalize">
                          {course?.level}
                        </span>
                      </div>
                      <div className="m-1 flex shrink-0 items-center rounded bg-gray-200 px-2 py-1 shadow-md">
                        <img
                          src={book}
                          alt="Icono de estudio"
                          className="mr-2 h-4 w-4"
                        />
                        <span className="text-primary-500 text-sm">
                          {course?.chapters?.length} {t('Chapters')}
                        </span>
                      </div>
                      <div className="m-1 flex shrink-0 items-center rounded bg-gray-200 px-2 py-1 shadow-md">
                        <img
                          src={watch}
                          alt="Icono de estudio"
                          className="mr-2 h-4 w-4"
                        />
                        <span className="text-primary-500 text-sm">
                          {course?.hours} {t('hours')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Agregamos clases para ocultar el div en dispositivos móviles */}
              <div className="hidden md:block lg:block xl:block 2xl:block">
                <h1 className="text-primary-700  text-3xl font-semibold  lg:text-5xl">
                  {course.name}
                </h1>
                <h2 className="text-primary-700 mt-4 text-lg font-light italic">
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
                    `courses/${course.id}/assets/thumbnail.png`
                  )}
                  alt={t('imagesAlt.courseThumbnail')}
                />
              </div>
              <div className="  hidden w-full flex-col space-y-5 p-3 md:block md:px-0 lg:block xl:block 2xl:block ">
                <div className="flex flex-row items-start space-x-5 ">
                  <FaChalkboardTeacher size="35" className="text-orange-600" />
                  <span className="font-body w-full rounded bg-gray-200 px-3 py-1">
                    {t('courses.details.teachers', {
                      teachers: t('words.rogzy'),
                    })}
                  </span>
                </div>
                <div className="flex flex-row items-start space-x-5">
                  <HiOutlineAcademicCap size="35" className="text-orange-600" />
                  <span className="font-body w-full rounded bg-gray-200 px-3 py-1">
                    {t(`courses.details.level`, { level: course.level })}
                  </span>
                </div>
                <div className="flex flex-row items-start space-x-5">
                  <HiOutlineBookOpen size="35" className="text-orange-600" />
                  <span className="font-body w-full rounded bg-gray-200 px-3 py-1">
                    {t('courses.details.numberOfChapters', {
                      number: course.chapters?.length,
                    })}
                  </span>
                </div>
                <div className="flex flex-row items-start space-x-5">
                  <IoMdStopwatch size="35" className="text-orange-600" />
                  <span className="font-body w-full rounded bg-gray-200 px-3 py-1">
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
                        to={generatePath(Routes.CourseChapter, {
                          courseId,
                          chapterIndex: '1',
                        })}
                      >
                        <Button variant="tertiary" rounded>
                          <span className="md:px-6">Start the course</span>
                        </Button>
                      </Link>
                      <img
                        src={rabbitHikingModal}
                        alt=""
                        className="absolute bottom-1 left-1 z-[+1] h-14 -translate-x-1/2"
                      ></img>
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
                          to={generatePath(Routes.CourseChapter, {
                            courseId,
                            chapterIndex: '1',
                          })}
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
                  <h4 className="text-primary-800 mb-1 text-sm font-semibold uppercase italic sm:hidden">
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
                      <h3 className="text-primary-700 sm:text-primary-800 mb-5 text-base font-normal sm:text-2xl sm:font-normal">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-primary-700 mb-3 text-justify text-xs sm:text-sm ">
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
                  <h4 className="text-primary-700 mb-1 py-1 text-xs font-semibold uppercase italic sm:hidden">
                    {t('courses.details.objectives')}
                  </h4>
                </div>
                <h4 className="mb-1 hidden text-sm font-light uppercase italic sm:block">
                  {t('courses.details.objectives')}
                </h4>
                <h3 className="text-primary-800 mb-5 hidden text-2xl  font-normal sm:block md:text-2xl lg:text-xl xl:text-lg 2xl:text-lg">
                  {t('courses.details.objectivesTitle')}
                </h3>
                <ul className="text-primary-700 space-y-2 text-xs font-light capitalize sm:text-base sm:uppercase">
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
                  <h4 className="text-primary-800 mb-1 text-sm  font-semibold uppercase italic sm:hidden">
                    {t('courses.details.curriculum')}
                  </h4>
                </div>
                <h4 className="mb-5 hidden text-sm font-light italic sm:block">
                  {t('courses.details.curriculum')}
                </h4>
                <ul className="ml-5 space-y-5 text-xs capitalize sm:text-base sm:uppercase">
                  {course.chapters?.map((chapter, index) => (
                    <li key={index}>
                      <div className="mb-1 flex flex-row">
                        <RxTriangleDown
                          className="mr-2 mt-1 text-orange-800"
                          size={20}
                        />
                        <Link
                          to={generatePath(Routes.CourseChapter, {
                            courseId,
                            language,
                            chapterIndex: chapter.chapter.toString(),
                          })}
                          key={chapter.chapter}
                        >
                          <p className="ml-1 text-base font-semibold capitalize text-orange-800 sm:text-lg sm:uppercase ">
                            {chapter.title}
                          </p>
                        </Link>
                      </div>
                      {chapter.sections?.map((section, index) => (
                        <div
                          className="mb-0.5 ml-10 flex flex-row items-center"
                          key={index}
                        >
                          <BsCircleFill
                            className="text-primary-300 mr-2"
                            size={7}
                          />
                          <Link
                            className="text-primary-700"
                            to={generatePath(Routes.CourseChapter, {
                              courseId,
                              chapterIndex: chapter.chapter.toString(),
                            })}
                          >
                            {section}
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
                    alt={t('imagesAlt.curriculum')}
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
