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
          <div className="flex flex-col items-center justify-center w-full h-full px-2 py-10">
            <div className="flex flex-col max-w-5xl px-2 space-y-2 md:flex-row items-left md:items-center md:space-x-10">
              {isScreenLg ? (
                <div
                  className="flex flex-col items-center justify-center w-40 h-40 text-5xl font-bold text-white uppercase bg-orange-800 rounded-full min-w-40"
                  title={`Course ID: ${course.id}`}
                >
                  <span>{course.id.match(/[A-Za-z]+/)?.[0] || ''}</span>
                  <span>{course.id.match(/\d+/)?.[0] || ''}</span>
                </div>
              ) : (
                <div
                  className="p-2 text-5xl font-bold text-white uppercase bg-orange-800 w-fit h-25 rounded-xl"
                  title={`Course ID: ${course.id}`}
                >
                  {course.id}
                </div>
              )}
              <div className="max-w-3xl space-y-3">
                <h1 className="text-5xl font-semibold text-primary-700">
                  {course.name}
                </h1>
                <h2 className="text-lg italic font-thin text-primary-700">
                  {t('courses.goal', { goal: course.goal })}
                </h2>
              </div>
            </div>
            <hr className="w-full max-w-5xl my-8 border-2 border-gray-300" />
            <div className="grid max-w-5xl grid-row-2 md:grid-cols-2 md:my-2 gap-y-8 justify-items-stretch place-items-stretch">
              <div className="w-full px-2 md:px-10">
                <img
                  src="https://github.com/DecouvreBitcoin/sovereign-university-data/raw/main/courses/btc101/assets/thumbnail.png"
                  alt=""
                />
              </div>
              <div className="grid w-full grid-rows-5 gap-y-1 ">
                <div className="flex flex-row items-center space-x-5">
                  <FaChalkboardTeacher size="30" className="text-orange-600" />
                  <span className="w-full px-3 py-1 bg-gray-200 rounded font-body">
                    {t('courses.details.teachers', { teachers: 'Rogzy' })}
                  </span>
                </div>
                <div className="flex flex-row items-center space-x-5">
                  <HiOutlineAcademicCap size="30" className="text-orange-600" />
                  <span className="w-full px-3 py-1 bg-gray-200 rounded font-body">
                    {t(`courses.details.level`, { level: course.level })}
                  </span>
                </div>
                <div className="flex flex-row items-center space-x-5">
                  <HiOutlineBookOpen size="30" className="text-orange-600" />
                  <span className="w-full px-3 py-1 bg-gray-200 rounded font-body">
                    {t('courses.details.numberOfChapters', {
                      number: course.chapters?.length,
                    })}
                  </span>
                </div>
                <div className="flex flex-row items-center space-x-5">
                  <IoMdStopwatch size="30" className="text-orange-600" />
                  <span className="w-full px-3 py-1 bg-gray-200 rounded font-body">
                    {t('courses.details.duration', { hours: course.hours })}
                  </span>
                </div>
                <div className="flex flex-row items-center space-x-5">
                  <MdOutlinePeople size="30" className="text-orange-600" />
                </div>
              </div>
            </div>
            <hr className="w-full max-w-5xl my-4 border-2 border-gray-300 md:my-8" />
            <div className="grid max-w-5xl px-2 my-4 grid-row-2 md:grid-cols-2 h-fit gap-y-10 md:gap-y-0 md:gap-x-20 justify-items-stretch place-items-stretch">
              {/* TODO: Render raw markdown description using custom components and style 
                <ReactMarkdown children={course.raw_description}></ReactMarkdown>
              */}
              <div className="flex flex-col w-full">
                <h4 className="mb-1 text-sm italic font-thin uppercase">
                  Description
                </h4>
                <ReactMarkdown
                  children={course.raw_description}
                  components={{
                    h1: ({ children }) => (
                      <h3 className="mb-5 text-2xl font-normal text-primary-800">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-2 mb-3 text-sm text-primary-700">
                        {children}
                      </p>
                    ),
                  }}
                ></ReactMarkdown>
              </div>
              <div className="flex flex-col w-full ">
                <h4 className="mb-1 text-sm italic font-thin uppercase">
                  Objectifs
                </h4>
                <h3 className="mb-5 text-2xl font-normal text-primary-800">
                  Qu'allez-vous apprendre dans ce cours ?
                </h3>
                <ul className="space-y-2 font-thin uppercase text-primary-700">
                  {course.objectives?.map((goal, index) => (
                    <li
                      className="flex flex-row space-x-3 justify-left items-top"
                      key={index}
                    >
                      <BsCheckCircle className="w-[20px] h-[20px] mt-1" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div></div>
            </div>
            <hr className="w-full max-w-5xl my-4 border-2 border-gray-300 md:my-8" />
            <div className="max-w-5xl grid-cols-2 px-2 my-4 md:grid h-fit gap-x-20 justify-items-stretch place-items-stretch">
              <div className="flex flex-col h-fit">
                <h4 className="mb-5 text-sm italic font-thin uppercase">
                  Curriculum
                </h4>
                <ul className="ml-5 space-y-5">
                  {course.chapters?.map((chapter) => (
                    <li>
                      <div className="flex flex-row mb-1">
                        <RxTriangleDown
                          className="mt-1 mr-2 text-orange-800"
                          size={20}
                        />
                        <Link
                          to={`/course/${courseId}/${language}/${chapter.chapter}`}
                          key={chapter.chapter}
                        >
                          <p className="text-lg font-thin text-orange-800 uppercase ">
                            {chapter.title}
                          </p>
                        </Link>
                      </div>
                      {chapter.sections?.map((section, index) => (
                        <div
                          className="flex flex-row items-center mb-0.5 ml-10"
                          key={index}
                        >
                          <BsCircleFill
                            className="mr-2 text-primary-300"
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
                    className="object-contain w-full h-full"
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
