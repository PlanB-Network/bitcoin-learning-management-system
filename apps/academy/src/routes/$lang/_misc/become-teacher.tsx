import { Button } from '@blms/ui';
import { getCalApi } from '@calcom/embed-react';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import type { IconType } from 'react-icons/lib';
import {
  TbCurrencyBitcoin,
  TbMapRoute,
  TbSchool,
  TbUsersGroup,
} from 'react-icons/tb';
import BitcoinPixel from '#src/assets/icons/pixelated/bitcoin-pixel.svg?react';
import WorldPixel from '#src/assets/icons/world-pixelated.svg?react';
import { PageLayout } from '#src/components/page-layout.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';

export const Route = createFileRoute('/$lang/_misc/become-teacher')({
  component: BecomeTeacher,
});

function BecomeTeacher() {
  const { t } = useTranslation();
  return (
    <PageLayout layoutSize="base" title={t('becomeTeacher.title')}>
      <p className="body-base md:body-large">
        {t('becomeTeacher.description')}
      </p>
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
          icon={TbMapRoute}
          i18nKey="becomeTeacher.enhanceExperience"
          defaultText="Enhance your students' learning experience"
        />
      </div>
      <h2 className="title-medium mt-10 md:mt-16">
        {t('becomeTeacher.inspireLearners')}
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(234px,1fr))] gap-4 mt-6">
        <InfoBox
          icon={<BitcoinPixel className="h-11" />}
          subtitle={t('becomeTeacher.bitcoinOnly')}
        />
        <InfoBox
          title={t('becomeTeacher.superiorAmount', { amount: '10,000' })}
          subtitle={t('becomeTeacher.activeBitcoinLearners')}
        />
        <InfoBox
          icon={<WorldPixel className="h-11" />}
          subtitle={t('becomeTeacher.globalReach')}
        />
      </div>
      <CalComButton />
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

      <span className="body-large md:body-extra-large">
        <Trans i18nKey={i18nKey}>
          <span className="font-medium">{defaultText}</span>
        </Trans>
      </span>
    </span>
  );
};

interface InfoBoxProps {
  icon?: React.ReactNode;
  title?: string;
  subtitle: string;
}

const InfoBox = ({ icon, title, subtitle }: InfoBoxProps) => {
  return (
    <div className="w-full h-full sm:min-h-[184px] p-4 bg-neutral-50 rounded-2xl flex flex-col gap-2 justify-center items-center text-center">
      {icon && <div className="shrink-0 text-orange-500">{icon}</div>}
      {title && <h3 className="display-medium text-orange-500">{title}</h3>}
      <span className="subtitle-base">{subtitle}</span>
    </div>
  );
};

const CalComButton = () => {
  const { t } = useTranslation();
  const isMobile = useSmaller('md') || window.innerWidth < 768;

  useEffect(() => {
    (async () => {
      const cal = await getCalApi({
        namespace: 'become-a-teacher',
        embedJsUrl: 'https://cal.planb.network/embed/embed.js',
      });
      cal('ui', {
        theme: 'light',
        cssVarsPerTheme: {
          light: { 'cal-brand': '#ff5e00' },
          dark: { 'cal-brand': '#F7931A' },
        },
        hideEventTypeDetails: false,
        layout: 'month_view',
      });
    })();
  }, []);
  return (
    <Button
      data-cal-namespace="become-a-teacher"
      data-cal-link="asi0/become-a-teacher"
      data-cal-origin="https://cal.planb.network"
      data-cal-config='{"layout":"month_view","theme":"light"}'
      size={isMobile ? 'm' : 'l'}
      className="mt-10 md:mt-14 mx-auto"
    >
      {t('becomeTeacher.bookCall')}
    </Button>
  );
};
