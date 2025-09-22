import { Loader, SegmentedControl, SegmentedControlItem } from '@blms/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { CourseDiplomas } from './-components/course-diplomas.tsx';
import { GlobalCertifications } from './-components/global-certifications.tsx';

export const Route = createFileRoute(
  '/$lang/_content/certifications/my-certificates',
)({
  component: MyCertificates,
});

function MyCertificates() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { session } = useContext(AppContext);

  const [currentTab, setCurrentTab] = useState('global');

  useEffect(() => {
    if (session === null) {
      navigate({ to: '/' });
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  return (
    <PageLayout
      layoutSize="wide"
      title={t('words.myCertificates')}
      tabs={[
        {
          id: 'b-cert',
          label: t('words.bCert'),
          href: '/certifications/b-cert',
        },
        {
          id: 'my-certificates',
          label: t('bCert.myCertificates'),
          href: '/certifications/my-certificates',
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
          value={'global'}
          key={'global'}
          onClick={() => setCurrentTab('global')}
          className="w-full"
        >
          <p className="w-full">
            {t('dashboard.credentials.globalCertifications')}
          </p>
        </SegmentedControlItem>
        <SegmentedControlItem
          value={'course'}
          key={'course'}
          onClick={() => setCurrentTab('course')}
          className="w-full"
        >
          <p className="w-full">{t('dashboard.credentials.courseDiplomas')}</p>
        </SegmentedControlItem>
      </SegmentedControl>

      {currentTab === 'global' ? <GlobalCertifications /> : <CourseDiplomas />}
    </PageLayout>
  );
}
