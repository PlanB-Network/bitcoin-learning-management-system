import { Button, Card, cn, EmptyState, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { TbCertificateOff, TbEye } from 'react-icons/tb';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.ts';

export const CourseDiplomas = () => {
  const { t, i18n } = useTranslation();

  const { session, courses } = useContext(AppContext);

  const isLoggedIn = !!session;

  const { data: examResults, isFetched } = useQuery(
    trpc.user.courses.getAllSucceededUserExams.queryOptions(
      {
        language: i18n.language ?? 'en',
      },
      {
        enabled: !!session,
      },
    ),
  );

  return (
    <div className="flex flex-col mt-5 md:mt-8 text-newBlack-1">
      {!isFetched && isLoggedIn && <Loader size={'s'} />}
      {isFetched && examResults && examResults.length > 0 && (
        <>
          {/* Desktop */}
          <table className="max-md:hidden overflow table-auto w-full">
            <TableHead />
            <tbody>
              {examResults.map((exam, index) => {
                const course = courses?.find((c) => c.id === exam.courseId);
                if (!course) return null;

                return (
                  <tr
                    // biome-ignore lint/suspicious/noArrayIndexKey: explanation
                    key={index}
                    className={cn('mobile-body2 md:desktop-body1')}
                  >
                    <td className="px-1.5">
                      {exam.startedAt.toLocaleDateString()}
                    </td>
                    <td className="px-1.5">
                      <span>{exam.courseName}</span> -{' '}
                      <span className="uppercase">{course.index}</span>
                    </td>
                    <td className="px-1.5 font-medium">{`${exam.score}%`}</td>
                    <td className="px-1.5 py-2">
                      <Link to={`/courses/${exam.courseId}/retake-exam`}>
                        <Button className="gap-2.5" size={'s'}>
                          {t('words.view')}
                          <TbEye size={24} />
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
                    // biome-ignore lint/suspicious/noArrayIndexKey: explanation
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

                      <Link to={`/courses/${exam.courseId}/retake-exam`}>
                        <Button className="gap-2.5" size={'xs'}>
                          {t('words.view')}
                          <TbEye size={24} />
                        </Button>
                      </Link>
                    </p>
                    <p />
                  </Card>
                );
              })}
          </div>
        </>
      )}

      {(!isLoggedIn ||
        (isFetched && examResults && examResults.length === 0)) && (
        <EmptyState
          title={t('bCert.noDiplomasAvailable')}
          description={t('dashboard.credentials.completeACourse')}
          linkButton={{
            href: '/learn-anytime',
            label: t('bCert.chooseCourse'),
          }}
          icon={TbCertificateOff}
        />
      )}
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
