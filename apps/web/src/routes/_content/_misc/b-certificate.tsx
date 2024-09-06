import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { useEffect } from 'react';
import { FaArrowRightLong } from 'react-icons/fa6';

import { Button, Loader, cn } from '@blms/ui';

import bCertificatesImage from '#src/assets/about/b-certificates.webp';
import Question from '#src/assets/icons/question.svg?react';
import { PageLayout } from '#src/components/page-layout.js';
import { ReactPlayer } from '#src/components/react-player.js';
import { useGreater } from '#src/hooks/use-greater.js';
import { trpc } from '#src/utils/trpc.js';

import { BCertificateEvents } from './-components/b-certificate-events.tsx';

export const Route = createFileRoute('/_content/_misc/b-certificate')({
  component: BCertificate,
});

const BCertificateOrganize = () => {
  const isScreenMd = useGreater('md');

  return (
    <div className="flex flex-col items-center max-md:border border-darkOrange-5 rounded-2xl max-md:p-4">
      <div className="max-md:hidden h-px bg-newGray-1 w-full mb-4 md:mb-10" />
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
      <div className="max-md:hidden h-px bg-newGray-1 w-full mt-4 md:mt-10" />
    </div>
  );
};

function BCertificate() {
  const { data: events, isFetched } = trpc.content.getRecentEvents.useQuery();

  const filteredEvents = events
    ? events.filter(
        (event) => event.type === 'exam' && event.startDate > new Date(),
      )
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
      <div className="flex max-lg:flex-col justify-center items-center gap-9 mb-6 lg:mb-32">
        <img
          src={bCertificatesImage}
          alt="₿ Certificates"
          className="w-full max-lg:max-w-[70%] max-md:mr-[45%]"
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
      {isFetched && <BCertificateEvents events={filteredEvents} />}
      <div className="flex flex-col items-center mb-6 md:mb-20">
        <Question className="mb-2.5 md:mb-5" />
        <h3 className="mobile-h3 md:text-[32px] md:font-semibold md:leading-tight md:tracking-[0.25px] text-center">
          {t('bCertificate.curious')}
        </h3>
        <div className="max-w-4xl w-full overflow-hidden rounded-3xl mt-4 md:mt-12 aspect-video">
          <ReactPlayer
            url={'https://www.youtube.com/watch?v=9FDkHhUX3eU'}
            controls
            width={'100%'}
            height={'100%'}
          />
        </div>
        <span className="mt-5 mobile-h5 md:desktop-h5 text-newGray-2 text-center">
          {t('bCertificate.joeNakamotoVideo')}
        </span>
      </div>
      <BCertificateOrganize />
    </PageLayout>
  );
}
