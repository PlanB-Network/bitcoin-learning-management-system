import { CollapsibleDropdown, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { t } from 'i18next';
import { trpc } from '#src/utils/trpc.ts';

export const SummerSchool = ({
  courseId,
}: {
  courseId: string;
}) => {
  const { data: userProgress, isFetched: userProgressFetched } = useQuery(
    trpc.user.courses.getProgress.queryOptions({
      courseId,
    }),
  );

  const courseProgress = userProgress?.[0];
  const isSelectedForSummerSchool =
    courseProgress?.isSelectedForFinalLesson ?? false;

  return (
    <section className="flex flex-col mt-4 md:mt-8 w-full max-w-[1000px] gap-4 md:gap-8">
      <div className="flex flex-col gap-5">
        <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
          {t('dashboard.course.summerSchool')}
        </h2>
        <CollapsibleDropdown
          title={t('dashboard.course.summerSchoolInformation')}
          className="border border-newGray-4"
          variant="dark"
          defaultOpen={true}
          type="info"
        >
          <p className="whitespace-pre-line text-newBlack-4 body-14px md:body-16px ">
            {t('dashboard.course.summerSchoolDescription')}
          </p>
        </CollapsibleDropdown>
      </div>
      {userProgressFetched && userProgress ? (
        <>
          {isSelectedForSummerSchool ? (
            <div>
              <p>YOU ARE SELECTED</p>
            </div>
          ) : (
            <div>
              <p>Not selected...</p>
            </div>
          )}
        </>
      ) : (
        <Loader />
      )}
    </section>
  );
};
