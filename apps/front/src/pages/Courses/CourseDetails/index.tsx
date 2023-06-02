import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useTranslation } from 'react-i18next';
import { BsCheckCircle, BsCircleFill } from 'react-icons/bs';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { HiOutlineAcademicCap, HiOutlineBookOpen } from 'react-icons/hi';
import { IoMdStopwatch } from 'react-icons/io';
import { MdOutlinePeople } from 'react-icons/md';
import { RxTriangleDown } from 'react-icons/rx';
import ReactMarkdown from 'react-markdown';
import { Link, useNavigate } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import curriculumImage from '../../../assets/courses/curriculum.png';
import { MainLayout } from '../../../components/MainLayout';
import { useRequiredParams } from '../../../utils';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const CourseDetails: React.FC = () => {
  const { courseId, language } = useRequiredParams();

  const navigate = useNavigate();
  const { t } = useTranslation();
  const isScreenMd = useGreater('sm');
  const isScreenLg = useGreater('md');

  const { data: course } = trpc.content.getCourse.useQuery({
    id: courseId,
    language,
    includeChapters: true,
  });

  if (!course) navigate('/404');

  return (
    <MainLayout>
      <div className="bg-gray-100">
        {course && (
          <div className="flex h-full w-full flex-col items-center justify-center px-2 py-10">
            <div className="items-left flex max-w-5xl flex-col space-y-2 px-2 md:flex-row md:items-center md:space-x-10">
              {isScreenLg ? (
                <div
                  className="min-w-40 flex h-40 w-40 flex-col items-center justify-center rounded-full bg-orange-800 text-5xl font-bold uppercase text-white"
                  title={`Course ID: ${course.id}`}
                >
                  <span>{course.id.match(/[A-Za-z]+/)?.[0] || ''}</span>
                  <span>{course.id.match(/\d+/)?.[0] || ''}</span>
                </div>
              ) : (
                <div
                  className="h-25 w-fit rounded-xl bg-orange-800 p-2 text-5xl font-bold uppercase text-white"
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
                  {t('courses.goal', { goal: course.goal })}
                </h2>
              </div>
            </div>
            <hr className="my-8 w-full max-w-5xl border-2 border-gray-300" />
            <div className="grid-row-2 grid max-w-5xl place-items-stretch justify-items-stretch gap-y-8 md:my-2 md:grid-cols-2">
              <div className="w-full px-2 md:px-10">
                <img
                  src="https://github.com/DecouvreBitcoin/sovereign-university-data/raw/main/courses/btc101/assets/thumbnail.png"
                  alt=""
                />
              </div>
              <div className="grid w-full grid-rows-5 gap-y-1 ">
                <div className="flex flex-row items-center space-x-5">
                  <FaChalkboardTeacher size="30" className="text-orange-600" />
                  <span className="font-body w-full rounded bg-gray-200 px-3 py-1">
                    {t('courses.details.teachers', { teachers: 'Rogzy' })}
                  </span>
                </div>
                <div className="flex flex-row items-center space-x-5">
                  <HiOutlineAcademicCap size="30" className="text-orange-600" />
                  <span className="font-body w-full rounded bg-gray-200 px-3 py-1">
                    {t(`courses.details.level`, { level: course.level })}
                  </span>
                </div>
                <div className="flex flex-row items-center space-x-5">
                  <HiOutlineBookOpen size="30" className="text-orange-600" />
                  <span className="font-body w-full rounded bg-gray-200 px-3 py-1">
                    {t('courses.details.numberOfChapters', {
                      number: course.chapters?.length,
                    })}
                  </span>
                </div>
                <div className="flex flex-row items-center space-x-5">
                  <IoMdStopwatch size="30" className="text-orange-600" />
                  <span className="font-body w-full rounded bg-gray-200 px-3 py-1">
                    {t('courses.details.duration', { hours: course.hours })}
                  </span>
                </div>
                <div className="flex flex-row items-center space-x-5">
                  <MdOutlinePeople size="30" className="text-orange-600" />
                </div>
              </div>
            </div>
            <hr className="my-4 w-full max-w-5xl border-2 border-gray-300 md:my-8" />
            <div className="grid-row-2 my-4 grid h-fit max-w-5xl place-items-stretch justify-items-stretch gap-y-10 px-2 md:grid-cols-2 md:gap-x-20 md:gap-y-0">
              {/* TODO: Render raw markdown description using custom components and style 
                <ReactMarkdown children={course.raw_description}></ReactMarkdown>
              */}
              <div className="flex w-full flex-col">
                <h4 className="mb-1 text-sm font-thin uppercase italic">
                  Description
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
                      <p className="text-primary-700 mb-2 mb-3 text-sm">
                        {children}
                      </p>
                    ),
                  }}
                ></ReactMarkdown>
              </div>
              <div className="flex w-full flex-col ">
                <h4 className="mb-1 text-sm font-thin uppercase italic">
                  Objectifs
                </h4>
                <h3 className="text-primary-800 mb-5 text-2xl font-normal">
                  Qu'allez-vous apprendre dans ce cours ?
                </h3>
                <ul className="text-primary-700 space-y-2 font-thin uppercase">
                  {course.objectives?.map((goal, index) => (
                    <li
                      className="justify-left items-top flex flex-row space-x-3"
                      key={index}
                    >
                      <BsCheckCircle className="mt-1 h-[20px] w-[20px]" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div></div>
            </div>
            <hr className="my-4 w-full max-w-5xl border-2 border-gray-300 md:my-8" />
            <div className="my-4 h-fit max-w-5xl grid-cols-2 place-items-stretch justify-items-stretch gap-x-20 px-2 md:grid">
              <div className="flex h-fit flex-col">
                <h4 className="mb-5 text-sm font-thin uppercase italic">
                  Curriculum
                </h4>
                <ul className="ml-5 space-y-5">
                  {course.chapters?.map((chapter) => (
                    <li>
                      <div className="mb-1 flex flex-row">
                        <RxTriangleDown
                          className="mr-2 mt-1 text-orange-800"
                          size={20}
                        />
                        <Link
                          to={`/course/${courseId}/${language}/${chapter.chapter}`}
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
                            to={`/course/${courseId}/${language}/${chapter.chapter}#${index}`}
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
    </MainLayout>
  );
};
