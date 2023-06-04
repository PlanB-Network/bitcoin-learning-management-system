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

import curriculumImage from '../../../assets/courses/curriculum.png';
import { Routes } from '../../../types';
import { useRequiredParams } from '../../../utils';
import { CourseLayout } from '../CourseLayout';

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
        {course && (
          <div className="flex h-full w-full flex-col items-center justify-center px-2 py-6 md:py-10">
            <div className="flex max-w-5xl flex-col space-y-2 px-2 md:flex-row md:items-center md:space-x-10">
              {isScreenLg ? (
                <div
                  className="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-orange-800 text-5xl font-bold uppercase text-white"
                  title={`Course ID: ${course.id}`}
                >
                  <span>{course.id.match(/[A-Za-z]+/)?.[0] || ''}</span>
                  <span>{course.id.match(/\d+/)?.[0] || ''}</span>
                </div>
              ) : (
                <div
                  className="h-fit w-fit rounded-xl bg-orange-800 p-2 text-left text-5xl font-bold uppercase text-white"
                  title={`Course ID: ${course.id}`}
                >
                  {course.id}
                </div>
              )}
              <div className="max-w-3xl space-y-3">
                <h1 className="text-primary-700 text-5xl font-semibold">
                  {course.name}
                </h1>
                <h2 className="text-primary-700 text-lg font-thin italic">
                  {t('courses.details.goal', { goal: course.goal })}
                </h2>
              </div>
            </div>
            <hr className="my-8 w-full max-w-5xl border-2 border-gray-300" />
            <div className="grid max-w-5xl grid-rows-2 place-items-stretch justify-items-stretch gap-y-8 md:my-2 md:grid-cols-2 md:grid-rows-1">
              <div className="w-full px-2 md:pl-2 md:pr-10">
                <img
                  src="https://github.com/DecouvreBitcoin/sovereign-university-data/raw/main/courses/btc101/assets/thumbnail.png"
                  alt="Course thumbnail"
                />
              </div>
              <div className=" flex w-full flex-col space-y-5 p-3 md:px-0 ">
                <div className="flex flex-row items-start space-x-5">
                  <FaChalkboardTeacher size="35" className="text-orange-600" />
                  <span className="font-body w-full rounded bg-gray-200 px-3 py-1">
                    {t('courses.details.teachers', { teachers: 'Rogzy' })}
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
            <hr className="my-4 w-full max-w-5xl border-2 border-gray-300 md:my-8" />
            <div className="my-4 max-w-5xl grid-rows-2 place-items-stretch justify-items-stretch px-2 md:grid md:grid-cols-2 md:grid-rows-1 md:gap-x-20">
              <div className="mb-5 flex w-full flex-col md:mb-0">
                <h4 className="mb-1 text-sm font-normal uppercase italic">
                  {t('courses.details.description')}
                </h4>
                <ReactMarkdown
                  children={course.raw_description}
                  components={{
                    h1: ({ children }) => (
                      <h3 className="text-primary-800 mb-5 text-2xl font-normal">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-primary-700 mb-3 text-sm">
                        {children}
                      </p>
                    ),
                  }}
                ></ReactMarkdown>
              </div>
              <div className="flex w-full flex-col">
                <h4 className="mb-1 text-sm font-thin uppercase italic">
                  {t('courses.details.objectives')}
                </h4>
                <h3 className="text-primary-800 mb-5 text-2xl font-normal">
                  {t('courses.details.objectivesTitle')}
                </h3>
                <ul className="text-primary-700 space-y-2 font-thin uppercase">
                  {course.objectives?.map((goal, index) => (
                    <li className="flex flex-row space-x-3" key={index}>
                      <div>
                        <BsCheckCircle className="mt-1 h-4 w-4" />
                      </div>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <hr className="my-4 w-full max-w-5xl border-2 border-gray-300 md:my-8" />
            <div className="my-4 h-fit max-w-5xl grid-cols-2 place-items-stretch justify-items-stretch gap-x-20 px-2 md:grid">
              <div className="flex h-fit flex-col">
                <h4 className="mb-5 text-sm font-thin uppercase italic">
                  {t('courses.details.curriculum')}
                </h4>
                <ul className="ml-5 space-y-5">
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
                          <p className="text-lg font-thin uppercase text-orange-800 ">
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
                    alt="Curriculum"
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
