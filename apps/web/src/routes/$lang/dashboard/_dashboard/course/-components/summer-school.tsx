import { Banner, BannerDescription, BannerTitle } from '@blms/ui';
import { t } from 'i18next';
import SuccessParty from '#src/assets/icons/success_party.svg?react';

export const SummerSchool = ({
  courseId,
}: {
  courseId: string;
}) => {
  return (
    <section className="flex flex-col mt-4 md:mt-8 w-full max-w-[1000px] gap-4 md:gap-8">
      <div className="flex flex-col gap-5">
        <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
          {t('dashboard.course.summerSchool')}
        </h2>
      </div>
      <div>
        <Banner
          variant="success"
          icon={<SuccessParty className="fill-brightGreen-6" />}
        >
          <BannerTitle>
            Congratulations! You have been selected to participate in the Summer
            School!
          </BannerTitle>
          <BannerDescription>
            You are 1 of the 21 students selected for the exclusive Summer
            School
          </BannerDescription>
        </Banner>
      </div>
    </section>
  );
};
