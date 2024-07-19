import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import { capitalize } from 'lodash-es';
import React, { useContext, useEffect, useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';

import { Button } from '@sovereign-university/ui';

import { useGreater } from '#src/hooks/use-greater.js';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';

export const Route = createFileRoute('/dashboard/_dashboard/bcertificate')({
  component: DashboardBCertificate,
});

function DashboardBCertificate() {
  const navigate = useNavigate();

  const { session } = useContext(AppContext);
  if (!session) {
    navigate({ to: '/' });
  }

  const { data: exams } =
    trpc.user.bcertificate.getBCertificateResults.useQuery();

  const isScreenMd = useGreater('md');

  const [isResultsOpen, setIsResultOpen] = useState<boolean[]>([]);

  const handleResultsOpen = (index: number) => {
    setIsResultOpen((v) => v.map((value, i) => (i === index ? !value : value)));
  };

  useEffect(
    () =>
      setIsResultOpen(Array.from({ length: exams?.length ?? 0 }, () => false)),
    [exams],
  );

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <h3 className="text-2xl">{t('dashboard.bCertificate.bCertificate')}</h3>

      <section className="flex flex-col gap-4">
        <h4 className="mobile-h3 md:desktop-h6">
          {t('dashboard.bCertificate.assertLevel')}
        </h4>
        <p className="mobile-body2 md:desktop-body1 max-w-[579px] text-[rgba(5,10,20,0.75)]">
          {t('dashboard.bCertificate.presentation')}
        </p>
        <Link to="/b-certificate" className="shrink-0 w-fit">
          <Button
            mode="light"
            variant="newSecondary"
            size={isScreenMd ? 'm' : 's'}
            onHoverArrow
          >
            {t('dashboard.bCertificate.learnMore')}
          </Button>
        </Link>
      </section>

      <section className="flex flex-col gap-4">
        <h4 className="mobile-h3 md:desktop-h6">
          {t('dashboard.bCertificate.wantToPass')}
        </h4>
        <div className="flex max-lg:flex-col gap-4 lg:gap-12 lg:items-center">
          <p className="mobile-body2 md:desktop-body1 max-w-[495px] text-[rgba(5,10,20,0.75)]">
            {t('dashboard.bCertificate.organizedSessions')}
          </p>
          <Link to="/b-certificate" hash="bcertevents" className="shrink-0">
            <Button
              mode="light"
              variant="newPrimary"
              size={isScreenMd ? 'm' : 's'}
              onHoverArrow
            >
              {t('dashboard.bCertificate.bookExam')}
            </Button>
          </Link>
        </div>
      </section>

      <section className="flex flex-col">
        <h4 className="mobile-h3 md:desktop-h6 mb-4">
          {t('dashboard.bCertificate.gradesDiploma')}
        </h4>
        <p className="mobile-body2 md:desktop-body1 text-[rgba(5,10,20,0.75)] mb-6">
          {t('dashboard.bCertificate.findResults')}
        </p>

        <div className="overflow-auto">
          <table className="overflow-scroll table-auto w-full max-w-5xl min-w-[400px] md:min-w-[600px]">
            <thead>
              <tr>
                <th className="text-left w-fit mobile-subtitle2 md:desktop-typo2 py-4 pr-1.5">
                  {t('words.date')}
                </th>
                <th className="text-left w-fit mobile-subtitle2 md:desktop-typo2 py-4 px-1.5">
                  {t('conferences.location')}
                </th>
                <th className="text-left w-5/12 mobile-subtitle2 md:desktop-typo2 py-4 px-1.5">
                  {t('words.bCertificate')}
                </th>
                <th className="text-left w-2/12 mobile-subtitle2 md:desktop-typo2 py-4 px-1.5">
                  {t('dashboard.bCertificate.grade')}
                </th>
                <th className="w-fit mobile-subtitle2 md:desktop-typo2 py-4 pl-1.5 text-center">
                  {t('dashboard.bCertificate.certificate')}
                </th>
              </tr>
            </thead>
            <tbody>
              {exams &&
                exams.length > 0 &&
                exams.map((exam, index) => (
                  <React.Fragment key={index}>
                    <tr
                      className={
                        isResultsOpen[index] ? 'border-b border-newGray-4' : ''
                      }
                    >
                      <td className="py-1.5 pr-1.5 mobile-body3 md:desktop-body1">
                        {exam.date.toLocaleDateString()}
                      </td>
                      <td className="p-1.5 mobile-body3 md:desktop-body1">
                        {exam.location}
                      </td>
                      <td className="p-1.5 mobile-body3 md:desktop-body1">
                        <div
                          className="flex justify-between items-center"
                          onClick={() => handleResultsOpen(index)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleResultsOpen(index);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                        >
                          <span className="font-medium uppercase">
                            {t('dashboard.bCertificate.general')}
                          </span>
                          <IoIosArrowDown
                            size={24}
                            className={
                              isResultsOpen[index]
                                ? 'transition-transform rotate-180'
                                : 'transition-transform rotate-0'
                            }
                          />
                        </div>
                      </td>
                      <td className="p-1.5 mobile-body3 md:desktop-body1">
                        {exam.results.reduce(
                          (total, result) => total + result.score,
                          0,
                        )}
                        /{exam.results.length * 20}
                      </td>
                      <td className="flex justify-center py-1.5 pl-1.5 mobile-body3 md:desktop-body1">
                        <Link to="#" className="inline-block">
                          <Button
                            mode="light"
                            variant="newPrimary"
                            size="xs"
                            disabled
                            className="mx-auto"
                          >
                            {t('words.download')}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                    {isResultsOpen[index] &&
                      [...exam.results].reverse().map((result, resultIndex) => (
                        <tr key={`${index}-${resultIndex}`}>
                          <td className="pr-1.5"></td>
                          <td></td>
                          <td className="p-1.5 mobile-body3 md:desktop-body1">
                            <p>
                              {t('words.part')}{' '}
                              {`${resultIndex + 1} - ${capitalize(result.category)}`}{' '}
                              : {`${result.score} / 20`}
                            </p>
                          </td>
                          <td className="p-1.5 mobile-body3 md:desktop-body1">
                            <p>{`${result.score} / 20`}</p>
                          </td>
                          <td className="pl-1.5"></td>
                        </tr>
                      ))}
                  </React.Fragment>
                ))}
              {exams && exams.length === 0 && (
                <tr>
                  <td
                    className="text-newBlack-4 whitespace-pre-line text-center"
                    colSpan={5}
                  >
                    {t('dashboard.bCertificate.noResults')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
