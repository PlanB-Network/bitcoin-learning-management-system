import { BasicModal, Button, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { FaTelegram } from 'react-icons/fa6';
import { MdOutlineEmail } from 'react-icons/md';
import bCertsImage from '#src/assets/about/bcert-presentation.webp?no-inline';
import { PageLayout } from '#src/components/page-layout.js';
import { trpc } from '#src/utils/trpc.js';
import { BCertEvents } from './-components/b-cert-events.tsx';

export const Route = createFileRoute('/$lang/_content/certifications/b-cert')({
  component: BCert,
});

function BCert() {
  const { data: events, isFetched } = useQuery(
    trpc.content.getRecentEvents.queryOptions(),
  );
  const { t } = useTranslation();

  const ONE_HOUR = 60 * 60 * 1000;
  const now = Date.now();

  const filteredEvents = events
    ? events.filter((event) => {
        const endDate = event.endDate.getTime();

        return event.type === 'exam' && now < endDate + ONE_HOUR;
      })
    : [];

  useEffect(() => {
    if (isFetched && window.location.href.includes('#bcertevents')) {
      const element = document.querySelector('#bcertevents');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [isFetched]);

  return (
    <PageLayout
      layoutSize="wide"
      title={t('bCert.pageTitle')}
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
      actionButtons={[<OrganizeDialog key="organize-dialog" />]}
    >
      <div className="flex max-md:flex-col justify-center items-center gap-12 mt-4 md:mt-6">
        <img
          src={bCertsImage}
          alt="₿ Certificates"
          className="w-full max-w-[304px] [overflow-clip-margin:_unset]"
        />
        <div className="flex flex-col w-full">
          <h3 className="title-medium text-newBlack-1">
            {t('bCert.knowledgeableBitcoin')}
          </h3>
          <span className="title-base text-neutral-600">
            {t('bCert.challengeYourself')}
          </span>
          <p className="body-base text-newBlack-1 whitespace-pre-line mt-5">
            {t('bCert.bCertDescription')}
          </p>
        </div>
      </div>
      {!isFetched ? <Loader size={'s'} /> : null}
      {isFetched ? <BCertEvents events={filteredEvents} /> : null}
    </PageLayout>
  );
}

const OrganizeDialog = () => {
  const { t } = useTranslation();

  return (
    <BasicModal
      trigger={
        <Button variant="newTertiary" size="s" rounded>
          {t('bCert.organizeExam')}
        </Button>
      }
      title={t('bCert.wantHostSession')}
      content={
        <p className="text-left">
          <Trans i18nKey="bCert.hostSessionConditions">
            <a
              href="https://kutt.planb.network/BCERT-chart"
              target="_blank"
              rel="noopener noreferrer"
              className="text-darkOrange-5 font-semibold"
            >
              charter
            </a>
          </Trans>
        </p>
      }
    >
      <div className="!flex max-md:flex-col gap-3 w-full">
        <Button variant="secondary" size="xl" asChild>
          <a
            href="https://t.me/+PViWTu5CctQ1ZTc8"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-2.5"
          >
            <FaTelegram />
            {t('words.telegram')}
          </a>
        </Button>
        <Button variant="primary" size="xl" asChild>
          <a
            href="mailto:bcert@planb.network"
            className="w-full flex items-center gap-2.5"
          >
            <MdOutlineEmail />
            {t('words.email')}
          </a>
        </Button>
      </div>
    </BasicModal>
  );
};
