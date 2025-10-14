import { SegmentedControl, SegmentedControlItem } from '@blms/ui';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.tsx';
import { CourseDiplomas } from './-components/course-diplomas.tsx';
import { GlobalCertifications } from './-components/global-certifications.tsx';

export const Route = createFileRoute(
  '/$lang/_content/certifications/certificates',
)({
  component: Certificates,
});

function Certificates() {
  const { t } = useTranslation();

  const [currentTab, setCurrentTab] = useState('course');

  return (
    <PageLayout
      layoutSize="wide"
      title={t('bCert.certificates')}
      tabs={[
        {
          id: 'certificates',
          label: t('bCert.certificates'),
          href: '/certifications/certificates',
        },
        {
          id: 'b-cert',
          label: t('words.bCert'),
          href: '/certifications/b-cert',
        },
      ]}
    >
      <SegmentedControl
        variant="outline"
        defaultValue={'global'}
        value={currentTab}
        className="w-full"
      >
        <SegmentedControlItem
          value={'course'}
          key={'course'}
          onClick={() => setCurrentTab('course')}
          className="w-full"
        >
          <p className="w-full">{t('dashboard.credentials.courseDiplomas')}</p>
        </SegmentedControlItem>
        <SegmentedControlItem
          value={'global'}
          key={'global'}
          onClick={() => setCurrentTab('global')}
          className="w-full"
        >
          <p className="w-full">
            {t('dashboard.credentials.globalCertifications')}
          </p>
        </SegmentedControlItem>
      </SegmentedControl>

      {currentTab === 'global' ? <GlobalCertifications /> : <CourseDiplomas />}
    </PageLayout>
  );
}
