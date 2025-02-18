import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { FaArrowRightLong, FaTelegram } from 'react-icons/fa6';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Loader,
  cn,
} from '@blms/ui';

import bCertsImage from '#src/assets/about/bcert-image.webp';
import { PageLayout } from '#src/components/page-layout.js';
import { trpc } from '#src/utils/trpc.js';

import { Trans, useTranslation } from 'react-i18next';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { BCertEvents } from './-components/b-cert-events.tsx';

import { MdOutlineEmail } from 'react-icons/md';
import PlanBLogoBlack from '#src/assets/logo/planb_logo_horizontal_black.svg';

export const Route = createFileRoute('/$lang/_content/_misc/b-cert')({
  component: BCert,
});

const BCertOrganize = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center max-md:border border-darkOrange-5 rounded-2xl max-md:p-4 text-center">
      <span className="text-darkOrange-5 max-md:text-xs max-md:font-medium max-md:leading-normal md:desktop-h7 max-md:hidden mb-2">
        {t('bCert.organizeSubtitle')}
      </span>
      <h3 className="text-darkOrange-5 md:text-white mobile-h2 md:desktop-h4 mb-5 md:mb-2">
        {t('bCert.organizeTitle')}
      </h3>
      <p className="leading-snug tracking-015px md:desktop-h8 mx-auto max-w-[665px] whitespace-pre-line">
        <Trans i18nKey="bCert.organizeDescription">
          <a
            href="https://kutt.planb.network/BCERT-chart"
            target="_blank"
            rel="noopener noreferrer"
            className="md:hover:text-darkOrange-5 font-semibold"
          >
            charter
          </a>
        </Trans>
      </p>
      <div className="relative flex max-md:flex-col justify-center items-center gap-2.5 md:gap-7 mt-6 md:mt-10">
        <OrganizeDialog />
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
      title={t('bCert.pageTitle')}
      subtitle={t('bCert.pageSubtitle')}
      footerVariant="dark"
      maxWidth="max-w-[1380px]"
    >
      <div className="flex max-lg:flex-col justify-center items-center gap-6 lg:gap-[80px] my-6 md:mt-14 lg:mb-14">
        <img
          src={bCertsImage}
          alt="₿ Certificates"
          className="w-full max-w-[472px] [overflow-clip-margin:_unset] max-h-[376px]"
        />
        <div className="flex flex-col w-full lg:max-w-[621px]">
          <h3 className="mobile-h2 md:desktop-h4 lg:mb-2.5">
            {t('bCert.knowledgeableBitcoin')}
          </h3>
          <span className="mobile-h3 md:text-2xl md:font-medium md:leading-tight md:tracking-[0.25px] text-darkOrange-5 mb-2.5 lg:mb-10">
            {t('bCert.challengeYourself')}
          </span>
          <p className="mobile-body2 md:desktop-h8">
            {t('bCert.bCertDescription')}
          </p>
        </div>
      </div>
      {!isFetched && <Loader size={'s'} />}
      {isFetched && <BCertEvents events={filteredEvents} />}

      <BCertOrganize />
    </PageLayout>
  );
}

const OrganizeDialog = () => {
  const isMobile = useSmaller('md');
  const { t } = useTranslation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary" size={isMobile ? 's' : 'l'} type="button">
          {t('bCert.organizeExam')}
          <FaArrowRightLong
            className={cn(
              'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
              'group-hover:ml-3',
            )}
          />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="!bg-white !shadow-course-navigation !border-[#D1D5DB] !rounded-[20px] !flex !flex-col !w-full max-w-[87.5%] md:!max-w-[530px] !px-[15px] !py-5 md:!p-6 gap-6 md:!gap-10 !items-center"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="hidden">
            {t('bCert.organizeSessionHub')}
          </DialogTitle>
          <DialogDescription className="hidden">
            {t('bCert.organizeSessionHub')}
          </DialogDescription>
        </DialogHeader>

        <img
          src={PlanBLogoBlack}
          alt="Logo Plan ₿ Network"
          className="w-[186px] md:w-[266px] mx-auto"
        />

        <div className="w-full justify-center items-center flex flex-col gap-5 md:gap-6 md:py-5">
          <p className="text-darkOrange-5 title-medium-sb-18px md:title-large-24px text-center px-7">
            {t('bCert.organizeSessionHub')}
          </p>

          <p className="subtitle-medium-16px md:subtitle-large-18px text-newBlack-1 text-center whitespace-pre-line">
            <Trans i18nKey="bCert.organizeSessionConditions">
              <a
                href="https://kutt.planb.network/BCERT-chart"
                target="_blank"
                rel="noopener noreferrer"
                className="md:hover:text-darkOrange-5 font-semibold"
              >
                charter
              </a>
            </Trans>
          </p>
        </div>

        <div className="!flex gap-4 md:!gap-[30px] pb-[30px]">
          <Button variant="primary" size={isMobile ? 's' : 'l'} asChild>
            <a
              href="mailto:bcert@planb.network"
              className="w-fit flex items-center gap-2.5"
            >
              <MdOutlineEmail />
              {t('words.email')}
            </a>
          </Button>
          <Button variant="primary" size={isMobile ? 's' : 'l'} asChild>
            <a
              href="https://t.me/B_CERT_test"
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit flex items-center gap-2.5"
            >
              <FaTelegram />
              {t('words.telegram')}
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
