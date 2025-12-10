import { createFileRoute } from '@tanstack/react-router';
import { Trans, useTranslation } from 'react-i18next';
import type { IconType } from 'react-icons/lib';
import { TbCurrencyBitcoin, TbSchool, TbUsersGroup } from 'react-icons/tb';
import { PageLayout } from '#src/components/page-layout.tsx';

export const Route = createFileRoute('/$lang/_misc/become-teacher')({
  component: BecomeTeacher,
});

function BecomeTeacher() {
  const { t } = useTranslation();
  return (
    <PageLayout layoutSize="base" title={t('becomeTeacher.title')}>
      <p className="body-large">{t('becomeTeacher.description')}</p>
      <div className="flex flex-col gap-4 mt-10">
        <InfoRow
          icon={TbUsersGroup}
          i18nKey="becomeTeacher.teachWhatYouLove"
          defaultText="Teach what you love"
        />
        <InfoRow
          icon={TbCurrencyBitcoin}
          i18nKey="becomeTeacher.joinMission"
          defaultText="Join the mission"
        />
        <InfoRow
          icon={TbSchool}
          i18nKey="becomeTeacher.hostOwnCourse"
          defaultText="Host your own course"
        />
        <InfoRow
          icon={TbUsersGroup}
          i18nKey="becomeTeacher.enhanceExperience"
          defaultText="Enhance your students' learning experience"
        />
      </div>
    </PageLayout>
  );
}

interface InfoRowProps {
  icon: IconType;
  i18nKey: string;
  defaultText: string;
}

const InfoRow = ({ icon: Icon, i18nKey, defaultText }: InfoRowProps) => {
  return (
    <span className="flex gap-4 items-center">
      <Icon size={32} className="shrink-0 text-orange-300" />

      <span className="text-xl leading-[160%] tracking-015px">
        <Trans i18nKey={i18nKey}>
          <span className="font-semibold">{defaultText}</span>
        </Trans>
      </span>
    </span>
  );
};
