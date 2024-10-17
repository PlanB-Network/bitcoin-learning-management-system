import { useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import { capitalize } from 'lodash-es';
import React, { useContext, useEffect, useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';

import type { JoinedBCertificateResults } from '@blms/types';
import { cn } from '@blms/ui';

import DummyBCert from '#src/assets/about/dummy-bcert.webp';
import { ButtonWithArrow } from '#src/molecules/button-arrow.tsx';
import { AppContext } from '#src/providers/context.js';
import { formatDate, formatTime } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.js';

export const GlobalCertifications = () => {
  const navigate = useNavigate();

  const { session } = useContext(AppContext);
  if (!session) {
    navigate({ to: '/' });
  }

  const { data: exams } =
    trpc.user.bcertificate.getBCertificateResults.useQuery();

  const { data: examTickets } = trpc.user.billing.getExamTickets.useQuery();

  const [isExamOpen, setIsExamOpen] = useState<boolean[]>([]);
  const [isTicketOpen, setIsTicketOpen] = useState<boolean[]>([]);

  const handleExamOpen = (index: number) => {
    setIsExamOpen((v) => v.map((value, i) => (i === index ? !value : false)));
    setIsTicketOpen((v) => v.map(() => false));
  };

  useEffect(() => {
    const results = Array.from({ length: exams?.length ?? 0 }, () => false);
    if (results.length > 0 && (!examTickets || examTickets.length === 0)) {
      results[results.length - 1] = true;
    }
    setIsExamOpen(results);
  }, [examTickets, exams]);

  const handleTicketOpen = (index: number) => {
    setIsTicketOpen((v) => v.map((value, i) => (i === index ? !value : false)));
    setIsExamOpen((v) => v.map(() => false));
  };

  let isLastElementSelected = false;
  if (isTicketOpen.length > 0 && isTicketOpen.at(-1) === true) {
    isLastElementSelected = true;
  } else if (
    isTicketOpen.length === 0 &&
    isExamOpen.length > 0 &&
    isExamOpen.at(-1) === true
    // eslint-disable-next-line sonarjs/no-duplicated-branches
  ) {
    isLastElementSelected = true;
  }

  useEffect(() => {
    const results = Array.from(
      { length: examTickets?.length ?? 0 },
      () => false,
    );
    if (results.length > 0) {
      results[results.length - 1] = true;
    }
    setIsTicketOpen(results);
  }, [examTickets, exams]);

  return (
    <div className="flex flex-col gap-4 lg:gap-8 mt-10">
      <section className="flex flex-col">
        <h4 className="mobile-h3 md:desktop-h6 mb-4">
          {t('dashboard.credentials.bCertificate')}
        </h4>
        <p className="mobile-body2 md:desktop-body1 text-newBlack-4 whitespace-pre-line">
          {t('dashboard.credentials.bCertificateSubtitle')}
        </p>

        <div className="mt-10">
          <table className="overflow-scroll table-auto w-full max-w-5xl min-w-[400px] md:min-w-[600px]">
            <thead>
              <tr className="border-b border-newGray-1 text-left">
                <th className="w-2/12 py-2 mobile-subtitle2 md:desktop-typo2 pr-1.5">
                  {t('words.date')}
                </th>
                <th className="mobile-subtitle2 md:desktop-typo2 px-1.5">
                  {t('conferences.location')}
                </th>
                <th className="w-2/12 mobile-subtitle2 md:desktop-typo2 px-1.5">
                  {t('words.id')}
                </th>
                <th className="w-[8%] mobile-subtitle2 md:desktop-typo2 px-1.5">
                  {t('dashboard.bCertificate.grade')}
                </th>
                <th className="w-[15%] mobile-subtitle2 md:desktop-typo2 pl-6">
                  {t('words.status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {exams &&
                exams.length > 0 &&
                exams.map((exam, index) => {
                  const hasPassed =
                    exam.score !== undefined && exam.score > exam.minScore;
                  const examScore = exam.results.reduce(
                    (total, result) => total + result.score,
                    0,
                  );

                  return (
                    <React.Fragment key={index}>
                      <tr
                        className={cn(
                          'mobile-body3 md:desktop-body1 hover:font-medium',
                          isExamOpen[index] ? 'bg-newGray-6' : '',
                        )}
                        onClick={() => handleExamOpen(index)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleExamOpen(index);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                      >
                        <td className="py-6 pr-1.5">
                          {exam.date.toLocaleDateString()}
                        </td>
                        <td className="">{exam.location}</td>
                        <td className="">
                          <div className="">{exam.id.slice(0, 8)}</div>
                        </td>
                        <td
                          className={cn(
                            'font-medium items-center h-full',
                            hasPassed ? 'text-brightGreen-6' : 'text-red-5',
                          )}
                        >
                          <span className="float-end">
                            {(examScore * 100) / (exam.results.length * 20)}%
                          </span>
                        </td>
                        <td
                          className={cn(
                            'italic pl-8',
                            hasPassed ? 'text-brightGreen-6' : 'text-red-5',
                          )}
                        >
                          {hasPassed ? t('words.passed') : t('words.failed')}
                        </td>
                        <td>
                          <div>
                            <IoIosArrowDown
                              size={24}
                              className={cn(
                                'text-newGray-1 transition-transform',
                                isExamOpen[index] && 'rotate-180',
                              )}
                            />
                          </div>
                        </td>
                      </tr>
                      {isExamOpen[index] && (
                        <tr className="bg-newGray-6">
                          {hasPassed ? (
                            <>
                              <td></td>
                              <td colSpan={4} className="pr-32">
                                <BcertDetails
                                  exam={exam}
                                  examScore={examScore}
                                  examIndex={index}
                                />
                                <div className="text-newOrange-5 font-medium uppercase mt-8">
                                  {t('dashboard.credentials.yourCertificate')}
                                </div>
                                <div className="italic">
                                  Download of certificate will be available soon
                                </div>
                                <div className="h-6"></div>
                              </td>
                              <td colSpan={1}></td>
                            </>
                          ) : (
                            <>
                              {/* <tr className="bg-newGray-6 border-b border-newGray-4 "> */}
                              <td className="pt-6" colSpan={6}>
                                <div className="flex flex-row gap-6">
                                  <img
                                    className="h-fit"
                                    src={DummyBCert}
                                    alt="Dummy b-cert"
                                  ></img>

                                  <div className="w-full pr-4">
                                    <BcertDetails
                                      exam={exam}
                                      examScore={examScore}
                                      examIndex={index}
                                    />
                                  </div>
                                </div>
                                <ButtonWithArrow className="float-right m-4">
                                  Retake the exam
                                </ButtonWithArrow>
                              </td>
                            </>
                          )}
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

              {examTickets &&
                examTickets.length > 0 &&
                examTickets.map((examTicket, index) => {
                  return (
                    <>
                      <tr
                        key={index}
                        className={cn(
                          'mobile-body3 md:desktop-body1 hover:font-medium',
                          isTicketOpen[index] ? 'bg-newGray-6' : '',
                        )}
                        onClick={() => handleTicketOpen(index)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleTicketOpen(index);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                      >
                        <td>{examTicket.date.toLocaleDateString()}</td>
                        <td>{examTicket.location}</td>
                        <td></td>
                        <td></td>
                        <td className="italic pl-8">Booked</td>
                        <td>
                          <div>
                            <IoIosArrowDown
                              size={24}
                              className={cn(
                                'text-newGray-1 transition-transform',
                                isTicketOpen[index] && 'rotate-180',
                              )}
                            />
                          </div>
                        </td>
                      </tr>
                      {isTicketOpen[index] && (
                        <tr className="bg-newGray-6">
                          <td className=" pt-6" colSpan={2}>
                            <img src={DummyBCert} alt="Dummy b-cert"></img>
                          </td>
                          <td className="pt-6 " colSpan={3}>
                            {examTicket.date.getTime() < Date.now() ? (
                              <div className="items-center mobile-body3 md:desktop-body1 flex flex-col justify-between py-[2px] w-fit">
                                <p className="font-medium">
                                  Your seat at the exam session is booked
                                </p>
                                <span className="mt-6">
                                  The session will take place at
                                </span>
                                <span>{examTicket.addressLine1}</span>
                                <span>{examTicket.addressLine2}</span>
                                <span>{examTicket.addressLine3}</span>
                                <span>
                                  {`${formatDate(examTicket.date)} at ${formatTime(examTicket.date, examTicket.timezone)} (${examTicket.timezone})`}
                                </span>
                                <ButtonWithArrow className="mt-6">
                                  See ticket
                                </ButtonWithArrow>
                              </div>
                            ) : (
                              <div className="items-center mobile-body3 md:desktop-body1 flex flex-col justify-between py-[2px] w-fit">
                                <p className="font-medium text-center">
                                  Your exam is being graded. The results should
                                  be available in 1 or 2 weeks.
                                </p>
                                {/* // TODO Add rotating hourglass */}
                              </div>
                            )}
                          </td>
                          <td></td>
                        </tr>
                      )}
                    </>
                  );
                })}

              {exams && exams.length === 0 && (
                <tr>
                  <td
                    className="text-newBlack-4 whitespace-pre-line text-center pt-6"
                    colSpan={6}
                  >
                    {t('dashboard.bCertificate.noResults')}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="">
              <tr className="">
                <td
                  colSpan={6}
                  className={cn(
                    'rounded-b-xl shadow-lg  h-6 mb-4 ',
                    isLastElementSelected ? 'bg-newGray-6 ' : '',
                  )}
                ></td>
              </tr>
            </tfoot>
          </table>
        </div>
        {/* <div className="shadow-md">BBBBBBBBb</div> */}
      </section>
    </div>
  );
};

const BcertDetails = ({
  exam,
  examScore,
  examIndex,
}: {
  exam: JoinedBCertificateResults;
  examScore: number;
  examIndex: number;
}) => {
  return (
    <>
      <p className="text-newOrange-5 uppercase text-sm font-medium mb-2">
        {t('words.details')}
      </p>
      {[...exam.results].reverse().map((result, resultIndex) => (
        <div
          className="mt-2 mobile-body3 md:desktop-body1"
          key={`${examIndex}-${resultIndex}`}
        >
          <div className="flex flew-row justify-between border-b py-[2px]  border-newGray-4">
            <span>
              {t('words.part')}{' '}
              {`${resultIndex + 1} - ${capitalize(result.category)}`}
            </span>
            <span>{`${result.score}/20`}</span>
          </div>
        </div>
      ))}
      <div className="flex flex-row font-medium mt-4 justify-between">
        <span>{t('words.total')}</span>

        <span>
          {examScore} / {exam.results.length * 20}
        </span>
      </div>
    </>
  );
};
