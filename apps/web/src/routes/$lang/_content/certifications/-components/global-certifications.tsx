import type { JoinedBCertResults, Ticket } from '@blms/types';
import { Banner, BannerTitle, Button, EmptyState, RadialGauge } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { capitalize } from 'lodash-es';
import { useContext } from 'react';
import {
  TbBrandX,
  TbCalendarEvent,
  TbChevronDown,
  TbClock,
  TbDownload,
  TbFileCertificate,
  TbMap,
  TbMapPin,
} from 'react-icons/tb';
import ApprovedIcon from '#src/assets/icons/approved.svg?react';
import PaperCheckPixel from '#src/assets/icons/pixelated/paper_checked.svg?react';
import SandClock from '#src/assets/icons/sandClock/sand clock_bottom.svg?react';
import { AppContext } from '#src/providers/context.js';
import { ListElement2 } from '#src/routes/$lang/my-courses/-components/summer-school.tsx';
import { formatDate, formatTime } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.js';

export const GlobalCertifications = () => {
  const { session } = useContext(AppContext);

  const isLoggedIn = !!session;

  const { data: exams } = useQuery(
    trpc.user.bcert.getBCertResults.queryOptions(undefined, {
      enabled: isLoggedIn,
    }),
  );

  const { data: examTickets } = useQuery(
    trpc.user.billing.getExamTickets.queryOptions(undefined, {
      enabled: isLoggedIn,
    }),
  );

  return (
    <div className="flex flex-col gap-4 md:gap-8 mt-5 md:mt-8">
      {exams &&
        exams.length > 0 &&
        exams.map((exam, index) => (
          <BCertCard
            key={exam.id}
            exam={exam}
            examTicket={undefined}
            isFirst={index === 0}
          />
        ))}

      {examTickets &&
        examTickets.length > 0 &&
        examTickets.map((examTicket, index) => (
          <BCertCard
            key={examTicket.eventId}
            exam={undefined}
            examTicket={examTicket}
            isFirst={index === 0 && (!exams || exams.length === 0)}
          />
        ))}

      {(!isLoggedIn || (exams && exams.length === 0)) && (
        <EmptyState
          title={t('dashboard.credentials.noCertificatesAvailable')}
          description={t('dashboard.credentials.getGlobalRecognition')}
          linkButton={{
            href: '/certifications/b-cert',
            label: t('dashboard.credentials.exploreBCert'),
          }}
          icon={TbFileCertificate}
        />
      )}
    </div>
  );
};

const BCertCard = ({
  exam,
  examTicket,
  isFirst = false,
}: {
  exam?: JoinedBCertResults;
  examTicket?: Ticket;
  isFirst?: boolean;
}) => {
  const dateString = exam
    ? formatDate(exam.date)
    : formatDate(examTicket!.date);
  const timeString = exam
    ? formatTime(exam.date)
    : formatTime(examTicket!.date);
  const location = exam ? exam.location : examTicket!.location;
  const address = [examTicket?.addressLine2, examTicket?.addressLine3]
    .filter(Boolean)
    .join('\n');

  return (
    <details className="group rounded-2xl w-full bg-newGray-6" open={isFirst}>
      <summary className="[&::-webkit-details-marker]:hidden list-none px-3 md:px-6 py-3 border-b-transparent border-b group-open:border-b-neutral-100 flex items-center justify-between gap-2 text-black cursor-pointer">
        <span className="title-small md:title-base">{t('words.bCert')}</span>
        <TbChevronDown
          size={24}
          className="transition-transform group-open:-rotate-180 shrink-0"
        />
      </summary>
      <div className="p-3 md:p-6 flex flex-col gap-4 md:gap-6">
        {exam ? (
          exam.imgKey ? (
            <>
              <BCertGrade bcertResult={exam} />{' '}
              <BCertDetailedScore bcertResult={exam} />{' '}
            </>
          ) : (
            <Banner
              variant="inprogress"
              icon={<SandClock className="fill-maroon-7" />}
            >
              <BannerTitle>
                {t('dashboard.credentials.beingTimestamped')}
              </BannerTitle>
            </Banner>
          )
        ) : null}
        {!exam && examTicket && <BCertStatus examTicket={examTicket} />}
        <BCertSession
          location={location}
          date={dateString}
          time={timeString}
          address={exam ? undefined : address}
        />
      </div>
    </details>
  );
};

const BCertGrade = ({ bcertResult }: { bcertResult: JoinedBCertResults }) => {
  return (
    <div className="flex flex-col p-4 md:px-6 md:py-12 bg-white rounded-2xl w-full">
      <div className="flex flex-col w-full max-w-[549px] mx-auto items-center">
        <p className="body-base-bold md:label-large-med-20px text-green-500 md:mb-8 text-center">
          {getScoreMessage(bcertResult.score || 0)}
        </p>
        <RadialGauge
          percentage={bcertResult.score}
          label={t('dashboard.teacher.courses.finalScore')}
          variant="green"
          size="l"
        />
        {bcertResult.imgKey && (
          <img
            src={`/api/files/${bcertResult.imgKey}`}
            alt="BCert"
            className="mt-4 md:mt-8 rounded-3xl border border-newGray-5"
          />
        )}
        <div className="flex flex-row justify-between mt-4 w-full">
          <a
            href={`/api/files/zip/bcert/${bcertResult.pdfKey?.split('/').slice(1, 3).join('/')}`}
            download
            target="_blank"
            rel="noreferrer"
            className="w-full"
          >
            <div className="w-full flex max-md:flex-col md:items-center justify-between gap-4">
              <Button
                size={'m'}
                variant="primary"
                className="items-center flex gap-2.5 max-md:w-full"
              >
                {t('bCert.download')}
                <TbDownload className="size-[18px] md:size-6" />
              </Button>

              <div className="flex items-center gap-4">
                <span className="text-xs italic font-light text-black">
                  {t('dashboard.course.shareOnSocials')}
                </span>
                <div className="flex items-center gap-2.5">
                  <Link
                    to={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      t('bCert.tweetText', {
                        certificateUrl: `${window.location.origin}/en/bcert-certificates/${encodeURIComponent(bcertResult.imgKey ? bcertResult.imgKey.split('.').slice(0, 1).join('.') : '')}`,
                        emoji: '🏆',
                        score: `${bcertResult.score}`,
                      }),
                    )}`}
                    target="_blank"
                  >
                    <Button variant="tertiary" size="s">
                      <TbBrandX size={18} />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <Link
              to={
                '/tutorials/contribution/others/pbn-certificate-timestamping-dd16f8c0-00c1-45fd-8792-920612bed18f'
              }
              target="_blank"
              className="flex items-center mt-4 gap-2 text-neutral-400 hover:text-orange-500 hover:underline max-md:text-center max-md:justify-center"
            >
              <ApprovedIcon className="size-4" />
              <span>{t('bCert.verify')}</span>
            </Link>
          </a>
        </div>
      </div>
    </div>
  );
};

const BCertDetailedScore = ({
  bcertResult,
}: {
  bcertResult: JoinedBCertResults;
}) => {
  return (
    <details open className="group/details w-full">
      <summary className="[&::-webkit-details-marker]:hidden list-none flex items-center justify-between gap-2 text-black cursor-pointer mb-2">
        <span className="body-base-bold text-newBlack-3">
          {t('dashboard.credentials.detailedScore')}
        </span>
        <TbChevronDown
          size={16}
          className="transition-transform group-open/details:-rotate-180 shrink-0"
        />
      </summary>
      <div className="flex flex-col bg-white rounded-2xl p-2 md:p-5">
        {[...bcertResult.results].reverse().map((result, resultIndex) => (
          <ListElement2
            key={result.category}
            leftText={`${t('words.part')} ${resultIndex + 1} - ${capitalize(result.category)}`}
          >
            {`${result.score}/20`}
          </ListElement2>
        ))}
        <div className="flex justify-between label-strong py-2 md:py-3">
          <span>{t('words.total')}</span>
          <span>
            {bcertResult.score} / {bcertResult.results.length * 20}
          </span>
        </div>
      </div>
    </details>
  );
};

const BCertStatus = ({ examTicket }: { examTicket: Ticket }) => {
  const examDate = new Date(examTicket.date);
  const today = new Date();

  examDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return examDate >= today ? (
    <Banner variant="info" icon={<PaperCheckPixel className="fill-blue-600" />}>
      <BannerTitle>{t('events.eventInfos.sessionBooked')}</BannerTitle>
    </Banner>
  ) : (
    <Banner
      variant="inprogress"
      icon={<SandClock className="fill-maroon-7 md:w" />}
    >
      <BannerTitle>{t('dashboard.credentials.beingGraded')}</BannerTitle>
    </Banner>
  );
};

const BCertSession = ({
  location,
  address,
  date,
  time,
}: {
  location: string;
  address?: string;
  date: string;
  time: string;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="body-base-bold text-newBlack-3">
        {t('words.session')}
      </span>
      <div className="bg-white p-2 md:px-5 md:py-3 rounded-2xl">
        <ListElement2 icon={TbMap} leftText={t('words.location')}>
          {location}
        </ListElement2>
        {address && (
          <ListElement2 icon={TbMapPin} leftText={t('words.address')}>
            <span className="whitespace-pre-line">{address}</span>
          </ListElement2>
        )}
        <ListElement2 icon={TbCalendarEvent} leftText={t('words.date')}>
          {date}
        </ListElement2>
        <ListElement2 icon={TbClock} leftText={t('words.time')}>
          {time}
        </ListElement2>
      </div>
    </div>
  );
};

const getScoreMessage = (score: number) => {
  if (score >= 0 && score <= 20) {
    return t('dashboard.credentials.bCertResults.score020');
  }
  if (score >= 21 && score <= 40) {
    return t('dashboard.credentials.bCertResults.score2140');
  }
  if (score >= 41 && score <= 60) {
    return t('dashboard.credentials.bCertResults.score4160');
  }
  if (score >= 61 && score <= 80) {
    return t('dashboard.credentials.bCertResults.score6180');
  }
  if (score >= 81 && score <= 99) {
    return t('dashboard.credentials.bCertResults.score8199');
  }
  if (score === 100) {
    return t('dashboard.credentials.bCertResults.score100');
  }
  return '';
};
