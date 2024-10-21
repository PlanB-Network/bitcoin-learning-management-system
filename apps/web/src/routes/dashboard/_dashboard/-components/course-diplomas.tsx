import { Link, useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';

import { Button, Card, Loader, cn } from '@blms/ui';

import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.ts';

export const CourseDiplomas = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { session } = useContext(AppContext);
  if (!session) {
    navigate({ to: '/' });
  }
  const { data: examResults, isFetched } =
    trpc.user.courses.getAllSuccededUserExams.useQuery({
      language: i18n.language ?? 'en',
    });

  return (
    <div className="flex flex-col gap-4 lg:gap-8 mt-10">
      <section className="flex flex-col">
        <h4 className="mobile-h3 md:desktop-h6 mb-4">
          {t('dashboard.credentials.completionDiplomas')}
        </h4>
        <p className="mobile-body2 md:desktop-body1 text-newBlack-4 whitespace-pre-line">
          {t('dashboard.credentials.courseDiplomasSubtitle')}
        </p>

        {!isFetched && <Loader size={'s'} />}
        {isFetched && (
          <>
            {/* Desktop */}
            <table className="mt-10 max-md:hidden overflow table-auto w-full max-w-5xl min-w-[600px]">
              <TableHead />
              <tbody>
                {examResults &&
                  examResults.length > 0 &&
                  examResults.map((exam, index) => {
                    return (
                      <tr
                        key={index}
                        className={cn('mobile-body2 md:desktop-body1')}
                      >
                        <td className="px-1.5">
                          {exam.startedAt.toLocaleDateString()}
                        </td>
                        <td className="px-1.5">
                          <span>{exam.courseName}</span> -{' '}
                          <span className="uppercase">{exam.courseId}</span>
                        </td>
                        <td className="px-1.5 font-medium">{`${exam.score}%`}</td>
                        <td className="px-1.5 py-2">
                          <Link to={`/dashboard/course/${exam.courseId}`}>
                            <Button className="gap-2.5" size={'s'}>
                              {t('words.view')}
                              <HiOutlineMagnifyingGlass size={24} />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {/* Mobile */}
            <div className="md:hidden">
              {examResults &&
                examResults.length > 0 &&
                examResults.map((exam, index) => {
                  return (
                    <Card
                      key={index}
                      className={cn('p-2 my-4')}
                      withPadding={false}
                    >
                      <p className="mobile-subtitle1">
                        <span>{exam.courseName}</span> -{' '}
                        <span className="uppercase">{exam.courseId}</span>
                      </p>
                      <p className="flex flex-row justify-between items-end">
                        <p>
                          <span>{`${t('words.grade')} : `}</span>
                          <span className="font-medium">{`${exam.score}%`}</span>
                        </p>

                        <Link to={`/dashboard/course/${exam.courseId}`}>
                          <Button className="gap-2.5" size={'xs'}>
                            {t('words.view')}
                            <HiOutlineMagnifyingGlass size={24} />
                          </Button>
                        </Link>
                      </p>
                      <p className=""></p>
                    </Card>
                  );
                })}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

const TableHead = () => {
  return (
    <thead>
      <tr className="border-b border-newGray-1 text-left">
        <th className="w-2/10 py-2 mobile-subtitle2 md:desktop-typo2 px-1.5">
          {t('words.date')}
        </th>
        <th className="w-6/10 mobile-subtitle2 md:desktop-typo2 px-1.5">
          {t('words.course')}
        </th>
        <th className="w-1/10 mobile-subtitle2 md:desktop-typo2 px-1.5">
          {t('words.grade')}
        </th>
        <th className="w-1/10 mobile-subtitle2 md:desktop-typo2 px-1.5">
          {t('words.diploma')}
        </th>
      </tr>
    </thead>
  );
};
