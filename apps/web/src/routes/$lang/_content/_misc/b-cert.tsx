import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { FaArrowRightLong } from 'react-icons/fa6';

import { Button, Loader, cn } from '@blms/ui';

import bCertificatesImage from '#src/assets/about/bcert-image.webp';
import { PageLayout } from '#src/components/page-layout.js';
import { useGreater } from '#src/hooks/use-greater.js';
import { trpc } from '#src/utils/trpc.js';

import { useTranslation } from 'react-i18next';
import { BCertEvents } from './-components/b-cert-events.tsx';

export const Route = createFileRoute('/$lang/_content/_misc/b-cert')({
  component: BCert,
});

const BCertificateOrganize = () => {
  const isScreenMd = useGreater('md');
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center max-md:border border-darkOrange-5 rounded-2xl max-md:p-4">
      <div className="text-center">
        <span className="text-darkOrange-5 max-md:text-xs max-md:font-medium max-md:leading-normal md:desktop-h7 max-md:hidden">
          {t('bCertificate.organizeSubtitle')}
        </span>
        <h3 className="text-darkOrange-5 md:text-white mobile-h2 md:desktop-h4 mb-5 md:mb-2">
          {t('bCertificate.organizeTitle')}
        </h3>
        <p className="leading-snug tracking-015px md:desktop-h8 max-w-2xl mx-auto">
          {t('bCertificate.organizeDescription')}
        </p>
      </div>
      <div className="relative flex max-md:flex-col justify-center items-center gap-2.5 md:gap-7 mt-6 md:mt-10">
        <a
          href="https://kutt.planb.network/BCERT-chart"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="primary" size={isScreenMd ? 'l' : 's'}>
            {t('bCertificate.readChart')}
            <FaArrowRightLong
              className={cn(
                'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                'group-hover:ml-3',
              )}
            />
          </Button>
        </a>
        <a
          href="https://workspace.planb.network/apps/forms/s/AdXeMipQ7xrrXNyrtyZ2sCLs"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="primary" size={isScreenMd ? 'l' : 's'}>
            {t('bCertificate.organizeExam')}
            <FaArrowRightLong
              className={cn(
                'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                'group-hover:ml-3',
              )}
            />
          </Button>
        </a>
      </div>
    </div>
  );
};

function BCert() {
  const { data: events, isFetched } = trpc.content.getRecentEvents.useQuery();
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
        element.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    }
  }, [isFetched]);

  return (
    <PageLayout
      title={t('bCertificate.pageTitle')}
      subtitle={t('bCertificate.pageSubtitle')}
      footerVariant="dark"
      maxWidth="max-w-[1380px]"
    >
      <div className="flex max-lg:flex-col justify-center items-center gap-6 lg:gap-[111px] my-6 md:mt-14 lg:mb-32">
        <img
          src={bCertificatesImage}
          alt="₿ Certificates"
          className="w-full max-w-[456px] [overflow-clip-margin:_unset] max-h-[382px] "
        />
        <div className="flex flex-col lg:self-end lg:mb-3.5 w-full lg:max-w-[43%]">
          <h3 className="mobile-h2 md:desktop-h4 lg:mb-2.5">
            {t('bCertificate.knowledgeableBitcoin')}
          </h3>
          <span className="mobile-h3 md:text-2xl md:font-medium md:leading-tight md:tracking-[0.25px] text-darkOrange-5 mb-2.5 lg:mb-10">
            {t('bCertificate.challengeYourself')}
          </span>
          <p className="mobile-body2 md:desktop-h8">
            {t('bCertificate.bCertificateDescription')}
          </p>
        </div>
      </div>
      {!isFetched && <Loader size={'s'} />}
      {isFetched && <BCertEvents events={filteredEvents} />}

      <BCertificateOrganize />
    </PageLayout>
  );
}
